export const SERVER_INFO = `
SELECT
  version() AS version_full,
  split_part(current_setting('server_version'), '.', 1)::INT AS version_major,
  split_part(split_part(current_setting('server_version'), '.', 2), ' ', 1)::INT AS version_minor,
  current_setting('TimeZone') AS timezone,
  now() AS now,
  pg_postmaster_start_time() AS instance_start_time,
  EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))::BIGINT AS uptime,
  CASE
    WHEN EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) < 300 THEN
      CONCAT(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))::BIGINT, ' seconds')
    WHEN EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) < 72 * 3600 THEN
      CONCAT(
        FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 3600)::INT, 'h ',
        MOD(FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 60), 60)::INT, 'm'
      )
    ELSE
      CONCAT(
        FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 86400)::INT, 'd ',
        MOD(FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 3600), 24)::INT, 'h'
      )
  END AS uptime_txt,
  current_setting('max_connections')::INT AS max_connections,
  (SELECT count(*) FROM pg_stat_activity) AS active_connections;
`;

export const CPU_INFO = `
SELECT
current_setting('max_parallel_workers_per_gather') AS max_parallel_workers_per_gather,
current_setting('max_parallel_workers') AS max_parallel_workers,
current_setting('max_worker_processes') AS max_worker_processes`;

export const MEMORY_INFO = `
SELECT
current_setting('shared_buffers') AS shared_buffers,
current_setting('work_mem') AS work_mem,
current_setting('maintenance_work_mem') AS maintenance_work_mem,
current_setting('effective_cache_size') AS effective_cache_size,
current_setting('wal_buffers') AS wal_buffers`;

export const DISK_INFO = `
WITH data_size_info AS (
  SELECT pg_size_pretty(SUM(pg_database_size(datname))) AS data_size
  FROM pg_database
)
SELECT
  data_size_info.data_size,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS wal_size,
  current_setting('wal_segment_size') AS wal_segment_size,
  current_setting('max_wal_size') AS max_wal_size,
  current_setting('min_wal_size') AS min_wal_size,
  current_setting('wal_keep_size') AS wal_keep_size
FROM
  data_size_info`;

export const EXTENSIONS_LIST = `
SELECT
  extname AS name,
  extversion AS version
FROM pg_catalog.pg_extension
ORDER BY extname`;

export const DATABASE_INFO = `
WITH current_db AS (
  SELECT current_database() AS current_database
)
SELECT 
  d.datname AS "name",
  sd.description AS "description",
  d.datistemplate AS "is_template",
  pg_catalog.pg_get_userbyid(d.datdba) AS "owner",
  pg_encoding_to_char(d.encoding) AS "encoding",
  d.datcollate AS "collation",
  d.datctype AS ctype,
  pg_database_size(d.datname) AS "size_bytes",
  CASE
    WHEN pg_database_size(d.datname) < 1024 THEN 
      pg_database_size(d.datname) || ' Bytes'
    WHEN pg_database_size(d.datname) < 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / 1024.0, 2) || ' KB'
    WHEN pg_database_size(d.datname) < 1024 * 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / (1024.0 * 1024), 2) || ' MB'
    WHEN pg_database_size(d.datname) < 1024.0 * 1024 * 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE 
      round(pg_database_size(d.datname) / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS "size_readable",
  s.numbackends AS "active_connections",
  s.xact_commit AS "committed_ts",
  s.xact_rollback AS "rolled_back_ts"
FROM 
  pg_database d
LEFT JOIN 
  pg_shdescription sd ON d.oid = sd.objoid
LEFT JOIN 
  pg_stat_database s ON d.datname = s.datname
WHERE 
  d.datname = (SELECT current_database FROM current_db)`;

export const TABLES_LIST = `
SELECT 
  n.nspname AS schema_name,
  c.relname AS table_name,
  pg_catalog.obj_description(c.oid, 'pg_class') AS comment,
  c.relkind AS type,
  EXISTS (
    SELECT 1
    FROM pg_inherits i
    WHERE i.inhparent = c.oid
  ) AS has_partitions,
  (
    SELECT 
        CONCAT(pn.nspname, '.', pc.relname)
    FROM 
        pg_inherits i
    JOIN 
        pg_class pc ON i.inhparent = pc.oid
    JOIN 
        pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE 
        i.inhrelid = c.oid
  ) AS partition_of,
  c.reltuples AS row_estimate,
  pg_total_relation_size(c.oid) AS total_relation_size,
  pg_total_relation_size(c.oid) - pg_indexes_size(c.oid) - COALESCE(pg_total_relation_size(c.reltoastrelid), 0) AS heap_size,
  pg_total_relation_size(c.reltoastrelid) AS toast_size,
  pg_indexes_size(c.oid) AS indexes_size
FROM 
  pg_class c
JOIN 
  pg_namespace n ON n.oid = c.relnamespace
WHERE 
  n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
  AND c.relkind IN ('r', 'p', 'm', 'v')
ORDER BY 
  total_relation_size DESC`;

export const COLUMNS_LIST_BY_TABLE = `
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  json_agg(
      json_build_object(
          'position', a.attnum,
          'name', a.attname,
          'comment', pg_catalog.col_description(a.attrelid, a.attnum),
          'data_type', pg_catalog.format_type(a.atttypid, a.atttypmod),
          'default_value', pg_get_expr(ad.adbin, ad.adrelid),
          'is_pkey', EXISTS (
              SELECT 1
              FROM pg_index i
              WHERE i.indrelid = c.oid AND a.attnum = ANY(i.indkey) AND i.indisprimary
          ),
          'is_null', NOT a.attnotnull,
          'depends_on', (
              SELECT json_build_object(
                  'schema', rns.nspname,
                  'table', rc.relname,
                  'col', ra.attname
              )
              FROM pg_constraint fkc
              JOIN pg_class rc ON fkc.confrelid = rc.oid
              JOIN pg_namespace rns ON rc.relnamespace = rns.oid
              JOIN pg_attribute ra ON ra.attnum = ANY(fkc.confkey) AND ra.attrelid = rc.oid
              WHERE fkc.conrelid = c.oid AND a.attnum = ANY(fkc.conkey)
          )
      )
      ORDER BY a.attnum
  ) AS columns
FROM
  pg_class c
JOIN
  pg_namespace n ON n.oid = c.relnamespace
JOIN
  pg_attribute a ON a.attrelid = c.oid
LEFT JOIN
  pg_attrdef ad ON ad.adnum = a.attnum AND ad.adrelid = c.oid
WHERE
  n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
  AND c.relkind IN ('r', 'p', 'v', 'm')
  AND a.attnum > 0 AND NOT a.attisdropped
GROUP BY
  n.nspname, c.relname
ORDER BY
  n.nspname, c.relname`;

export const CONSTRAINTS_LIST_BY_TABLE = `
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  json_agg(
      json_build_object(
          'name', con.conname,
          'comment', obj_description(con.oid, 'pg_constraint'),
          'type', con.contype,
          'fkey_info', CASE 
              WHEN con.contype = 'f' THEN
                  json_build_object(
                      'schema', rns.nspname,
                      'table', rt.relname,
                      'columns', ARRAY(
                          SELECT a.attname
                          FROM pg_attribute a
                          WHERE a.attnum = ANY(con.confkey) AND a.attrelid = rt.oid
                      )
                  )
              ELSE NULL
          END,
          'columns', ARRAY(
              SELECT a.attname
              FROM pg_attribute a
              WHERE a.attnum = ANY(con.conkey) AND a.attrelid = c.oid
          ),
          'definition', pg_get_constraintdef(con.oid)
      )
      ORDER BY con.conname
  ) AS constraints
FROM
  pg_constraint con
JOIN
  pg_class c ON con.conrelid = c.oid
JOIN
  pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN
  pg_class rt ON con.confrelid = rt.oid
LEFT JOIN
  pg_namespace rns ON rt.relnamespace = rns.oid
WHERE
  n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
GROUP BY
  n.nspname, c.relname
`;

export const INDEXES_LIST_BY_TABLE = `
SELECT
  n.nspname AS schema_name,
  t.relname AS table_name,
  json_agg(
    json_build_object(
      'name', i.relname,
      'comment', obj_description(i.oid, 'pg_class'),
      'size_bytes', pg_relation_size(i.oid),
      'size_pretty', pg_size_pretty(pg_relation_size(i.oid)),
      'is_unique', ix.indisunique,
      'is_primary', ix.indisprimary,
      'definition', pg_get_indexdef(ix.indexrelid),
      'columns', ARRAY(
        SELECT a.attname
        FROM pg_attribute a
        JOIN unnest(ix.indkey) WITH ORDINALITY AS k (attnum, ord) ON a.attnum = k.attnum
        WHERE a.attrelid = t.oid
        ORDER BY k.ord
      ),
      'access_method', am.amname,
      'validity', CASE
        WHEN ix.indisvalid THEN 'valid'
        ELSE 'invalid'
      END
    )
    ORDER BY i.relname
  ) AS indexes
FROM
  pg_class t
JOIN
  pg_namespace n ON t.relnamespace = n.oid
JOIN
  pg_index ix ON t.oid = ix.indrelid
JOIN
  pg_class i ON ix.indexrelid = i.oid
JOIN
  pg_am am ON i.relam = am.oid
WHERE
  n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
  AND t.relkind IN ('r', 'p', 'm')
GROUP BY
  n.nspname, t.relname
ORDER BY
  n.nspname, t.relname;
`;