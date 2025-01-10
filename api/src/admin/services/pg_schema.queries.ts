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
