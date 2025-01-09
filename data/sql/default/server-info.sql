
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
SELECT
    current_database() as db_name,
    pg_catalog.pg_encoding_to_char(d.encoding) AS encoding,
    d.datcollate AS collation,
    d.datctype AS ctype
FROM
    pg_catalog.pg_database d
WHERE
    d.datname = current_database();

SELECT
    datname AS database_name,
    blks_read AS blocks_read,
    blks_hit AS blocks_hit,
    temp_files AS temporary_files,
    temp_bytes AS temporary_bytes,
    xact_commit AS transactions_committed,
    xact_rollback AS transactions_rolled_back,
    deadlocks AS deadlocks,
    blk_read_time AS block_read_time_ms,
    blk_write_time AS block_write_time_ms,
    stats_reset AS last_stats_reset
FROM
    pg_stat_database
WHERE
    datname = current_database();

