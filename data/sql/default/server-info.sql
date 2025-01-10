
-- Server Info
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
            ) -- Format as "22h 30m"
        ELSE
            CONCAT(
                FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 86400)::INT, 'd ',
                MOD(FLOOR(EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 3600), 24)::INT, 'h'
            ) -- Format as "10d 6h"
    END AS uptime_txt,
    current_setting('max_connections')::INT AS max_connections,
    (SELECT count(*) FROM pg_stat_activity) AS active_connections;
    
    
-- SET TimeZone = 'Europe/Stockholm';
-- SET TimeZone = 'Etc/UTC';


-- CPU Info
SELECT
    current_setting('max_parallel_workers_per_gather') AS max_parallel_workers_per_gather,
    current_setting('max_parallel_workers') AS max_parallel_workers,
    current_setting('max_worker_processes') AS max_worker_processes;

-- Memory Info
SELECT
    current_setting('shared_buffers') AS shared_buffers,       -- Amount of memory for shared buffers
    current_setting('work_mem') AS work_mem,                   -- Memory allocated for query operations
    current_setting('maintenance_work_mem') AS maintenance_work_mem, -- Memory for maintenance tasks
    current_setting('effective_cache_size') AS effective_cache_size, -- Memory PostgreSQL expects to use from the OS
    current_setting('wal_buffers') AS wal_buffers,
;

-- Disk Information
WITH data_size_info AS (
    SELECT
        pg_size_pretty(SUM(pg_database_size(datname))) AS data_size
    FROM
        pg_database
)
SELECT
    data_size_info.data_size,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS wal_size,
    current_setting('wal_segment_size') AS wal_segment_size,
    current_setting('max_wal_size') AS max_wal_size,
    current_setting('min_wal_size') AS min_wal_size,
    current_setting('wal_keep_size') AS wal_keep_size
FROM
    data_size_info;



-- Extensions
SELECT
    extname AS extension_name,
    extversion AS version
FROM
    pg_catalog.pg_extension
ORDER BY extname;


-- Database Info
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
  d.datname = (SELECT current_database FROM current_db);



-- Tables List
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    pg_catalog.obj_description(c.oid, 'pg_class') AS comment, -- Table comment
    c.relkind AS relation_kind,                               -- Relation kind (table, partition)
    EXISTS (
      SELECT 1
      FROM pg_inherits i
      WHERE i.inhparent = c.oid
    ) AS has_partitions,                                      -- True if this table has partitions
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
    ) AS partition_of,                                        -- Parent table if this is a partition
    c.reltuples AS row_estimate,                              -- Estimated rows
    pg_total_relation_size(c.oid) AS total_relation_size,     -- Total size (table + indexes + toast)
    pg_total_relation_size(c.oid) - pg_indexes_size(c.oid) - COALESCE(pg_total_relation_size(c.reltoastrelid), 0) AS heap_size, -- Heap size
    pg_total_relation_size(c.reltoastrelid) AS toast_size,    -- Toast size
    pg_indexes_size(c.oid) AS indexes_size                   -- Index size
FROM 
    pg_class c
JOIN 
    pg_namespace n ON n.oid = c.relnamespace
WHERE 
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND c.relkind IN ('r', 'p', 'm', 'v') -- Regular tables and partitioned tables
ORDER BY 
    total_relation_size DESC;


-- Columns List (plain tables)
SELECT
    n.nspname AS schema_name,                                          -- Schema name
    c.relname AS table_name,                                           -- Table name
    a.attnum AS position,                                       -- Column order
    a.attname AS name,                                          -- Column name
    pg_catalog.col_description(a.attrelid, a.attnum) AS comment, -- Column comment
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,      -- Data type
    pg_get_expr(ad.adbin, ad.adrelid) AS default_value,                -- Default value
    EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.oid AND a.attnum = ANY(i.indkey) AND i.indisprimary
    ) AS is_pkey,                                                     -- Is primary key
    NOT a.attnotnull AS is_null,                                      -- Is nullable
    (
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
    ) AS depends_on,                                                 -- Foreign key dependency
    (
        SELECT json_build_object(
            'n_distinct', st.n_distinct,
            'null_frac', st.null_frac,
            'avg_width', st.avg_width,
            'most_common_vals', st.most_common_vals,
            'most_common_freqs', st.most_common_freqs,
            'histogram_bounds', st.histogram_bounds
        )
        FROM pg_stats st
        WHERE st.schemaname = n.nspname AND st.tablename = c.relname AND st.attname = a.attname
    ) AS statistics                                                  -- Column statistics
FROM
    pg_class c
JOIN
    pg_namespace n ON n.oid = c.relnamespace
JOIN
    pg_attribute a ON a.attrelid = c.oid
LEFT JOIN
    pg_attrdef ad ON ad.adnum = a.attnum AND ad.adrelid = c.oid        -- Default value
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND c.relkind IN ('r', 'p', 'v', 'm')                             -- Include tables, partitions, views, materialized views
    AND a.attnum > 0 AND NOT a.attisdropped                          -- Valid user-defined columns
ORDER BY
    schema_name, table_name, position;
    
    
-- Columns List (aggregated by table)
SELECT
    n.nspname AS schema_name,                                          -- Schema name
    c.relname AS table_name,                                           -- Table name
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
    ) AS columns                                                      -- Aggregated JSON array of columns
FROM
    pg_class c
JOIN
    pg_namespace n ON n.oid = c.relnamespace
JOIN
    pg_attribute a ON a.attrelid = c.oid
LEFT JOIN
    pg_attrdef ad ON ad.adnum = a.attnum AND ad.adrelid = c.oid        -- Default value
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND c.relkind IN ('r', 'p', 'v', 'm')                             -- Include tables, partitions, views, materialized views
    AND a.attnum > 0 AND NOT a.attisdropped                          -- Valid user-defined columns
GROUP BY
    n.nspname, c.relname                                              -- Group by schema and table
ORDER BY
    n.nspname, c.relname;                                             -- Order by schema and table

-- Constraints List (plain)
SELECT
    n.nspname AS schema_name,                        -- Schema name
    c.relname AS table_name,                         -- Table name
    con.conname AS name,                             -- Constraint name
    obj_description(con.oid, 'pg_constraint') AS comment, -- Constraint comment (if available)
    con.contype AS type,                             -- Constraint type ('p' = primary key, 'f' = foreign key, 'u' = unique, 'c' = check, 'x' = exclusion)
    CASE 
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
    END AS fkey_info,                                -- Foreign key details (if applicable)
    ARRAY(
        SELECT a.attname
        FROM pg_attribute a
        WHERE a.attnum = ANY(con.conkey) AND a.attrelid = c.oid
    ) AS columns,                                   -- Columns involved in the constraint
    pg_get_constraintdef(con.oid) AS definition     -- Full constraint definition
FROM
    pg_constraint con
JOIN
    pg_class c ON con.conrelid = c.oid
JOIN
    pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN
    pg_class rt ON con.confrelid = rt.oid           -- Referenced table (for foreign keys)
LEFT JOIN
    pg_namespace rns ON rt.relnamespace = rns.oid   -- Referenced schema (for foreign keys)
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
ORDER BY
    schema_name, table_name, name;


-- Constraints List (aggregated by table)
SELECT
    n.nspname AS schema_name,                        -- Schema name
    c.relname AS table_name,                         -- Table name
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
    ) AS constraints                                   -- Aggregated JSON array of constraints
FROM
    pg_constraint con
JOIN
    pg_class c ON con.conrelid = c.oid
JOIN
    pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN
    pg_class rt ON con.confrelid = rt.oid             -- Referenced table (for foreign keys)
LEFT JOIN
    pg_namespace rns ON rt.relnamespace = rns.oid     -- Referenced schema (for foreign keys)
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
GROUP BY
    n.nspname, c.relname                               -- Group by schema and table
ORDER BY
    n.nspname, c.relname;                              -- Order by schema and table


