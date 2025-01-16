
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
    c.relkind AS type,                                        -- Relation kind (table, partition)
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



-- Indexes List
SELECT
    n.nspname AS schema_name,                                -- Schema name
    t.relname AS table_name,                                 -- Table name
    i.relname AS name,                                       -- Index name
    obj_description(i.oid, 'pg_class') AS comment,           -- Comment on the index
    pg_relation_size(i.oid) AS size_bytes,                   -- Index size in bytes
    pg_size_pretty(pg_relation_size(i.oid)) AS size_pretty,  -- Index size in a human-readable format
    ix.indisunique AS is_unique,                             -- Whether the index enforces uniqueness
    ix.indisprimary AS is_primary,                           -- Whether the index is a primary key
    pg_get_indexdef(ix.indexrelid) AS definition,            -- Index definition
    ARRAY(
        SELECT a.attname
        FROM pg_attribute a
        JOIN unnest(ix.indkey) WITH ORDINALITY AS k (attnum, ord) ON a.attnum = k.attnum
        WHERE a.attrelid = t.oid
        ORDER BY k.ord
    ) AS columns,                                            -- Columns used in the index
    am.amname AS access_method,                              -- Access method (e.g., btree, gin, etc.)
    CASE
        WHEN ix.indisvalid THEN 'valid'
        ELSE 'invalid'
    END AS validity                                          -- Validity of the index
FROM
    pg_class t                                               -- Table
JOIN
    pg_namespace n ON t.relnamespace = n.oid                 -- Schema
JOIN
    pg_index ix ON t.oid = ix.indrelid                       -- Index metadata
JOIN
    pg_class i ON ix.indexrelid = i.oid                      -- Index
JOIN
    pg_am am ON i.relam = am.oid                             -- Access method
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND t.relkind IN ('r', 'p', 'm')                         -- Only include regular and partitioned tables and materialized views
ORDER BY
    schema_name, table_name, name;
    


-- Indexes List (aggregated by table)
SELECT
    n.nspname AS schema_name,                                -- Schema name
    t.relname AS table_name,                                 -- Table name
    json_agg(
        json_build_object(
            'name', i.relname,                               -- Index name
            'comment', obj_description(i.oid, 'pg_class'),   -- Comment on the index
            'size_bytes', pg_relation_size(i.oid),           -- Index size in bytes
            'size_pretty', pg_size_pretty(pg_relation_size(i.oid)), -- Index size in a human-readable format
            'is_unique', ix.indisunique,                     -- Whether the index enforces uniqueness
            'is_primary', ix.indisprimary,                   -- Whether the index is a primary key
            'definition', pg_get_indexdef(ix.indexrelid),    -- Index definition
            'columns', ARRAY(
                SELECT a.attname
                FROM pg_attribute a
                JOIN unnest(ix.indkey) WITH ORDINALITY AS k (attnum, ord) ON a.attnum = k.attnum
                WHERE a.attrelid = t.oid
                ORDER BY k.ord
            ),                                              -- Columns used in the index
            'access_method', am.amname,                     -- Access method (e.g., btree, gin, etc.)
            'validity', CASE
                WHEN ix.indisvalid THEN 'valid'
                ELSE 'invalid'
            END                                             -- Validity of the index
        )
        ORDER BY i.relname                                   -- Sort indexes by name
    ) AS indexes                                             -- JSON array of index details
FROM
    pg_class t                                               -- Table
JOIN
    pg_namespace n ON t.relnamespace = n.oid                 -- Schema
JOIN
    pg_index ix ON t.oid = ix.indrelid                       -- Index metadata
JOIN
    pg_class i ON ix.indexrelid = i.oid                      -- Index
JOIN
    pg_am am ON i.relam = am.oid                             -- Access method
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND t.relkind IN ('r', 'p', 'm')                         -- Only include regular and partitioned tables and materialized views
GROUP BY
    n.nspname, t.relname                                     -- Group by schema and table
ORDER BY
    n.nspname, t.relname;                                    -- Sort by schema and table



-- Triggers List (plain)
SELECT
    n.nspname AS "schema_name",                                       -- Schema name
    c.relname AS "table_name",                                        -- Table name
    t.tgname AS name,                                            -- Trigger name
    obj_description(t.oid, 'pg_trigger') AS comment,             -- Trigger comment (if available)
    pg_catalog.pg_get_triggerdef(t.oid, true) AS definition,     -- Trigger definition
    t.tgenabled as enabled, -- D: disabled, A: enabled for all operations, O: enabled for same server events, R: enabled for replica operations only
    t.tgtype,
    CASE
        WHEN position('BEFORE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'BEFORE'
        WHEN position('AFTER' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'AFTER'
        WHEN position('INSTEAD OF' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'INSTEAD'
    END AS "timing",
    ARRAY(
        SELECT event
        FROM unnest(ARRAY[
            CASE WHEN position('INSERT' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'INSERT' END,
            CASE WHEN position('DELETE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'DELETE' END,
            CASE WHEN position('UPDATE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'UPDATE' END,
            CASE WHEN position('TRUNCATE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'TRUNCATE' END
        ]) AS event
        WHERE event IS NOT NULL
    ) AS "events",                                       -- Triggered events
    pg_proc.proname AS function_name,                            -- Trigger function name
    pg_proc.prosrc AS function_definition                        -- Trigger function source
FROM
    pg_trigger t
JOIN
    pg_class c ON t.tgrelid = c.oid                              -- Join to get table
JOIN
    pg_namespace n ON c.relnamespace = n.oid                     -- Join to get schema
JOIN
    pg_proc ON t.tgfoid = pg_proc.oid                            -- Join to get trigger function
WHERE
    NOT t.tgisinternal                                            -- Exclude internal triggers
    AND n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
ORDER BY
    "schema_name", "table_name", "name";



-- Triggers List (aggregated by table)
SELECT
    n.nspname AS "schema_name",
    c.relname AS "table_name",
    json_agg(json_build_object(
        'name', t.tgname,
        'comment', obj_description(t.oid, 'pg_trigger'),
        'definition', pg_catalog.pg_get_triggerdef(t.oid, true),
        'enabled', t.tgenabled,
        'tgtype', t.tgtype,
        'timing', CASE
            WHEN position('BEFORE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'BEFORE'
            WHEN position('AFTER' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'AFTER'
            WHEN position('INSTEAD OF' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'INSTEAD'
        END,
        'events', ARRAY(
            SELECT event
            FROM unnest(ARRAY[
                CASE WHEN position('INSERT' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'INSERT' END,
                CASE WHEN position('DELETE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'DELETE' END,
                CASE WHEN position('UPDATE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'UPDATE' END,
                CASE WHEN position('TRUNCATE' IN pg_catalog.pg_get_triggerdef(t.oid)) > 0 THEN 'TRUNCATE' END
            ]) AS event
            WHERE event IS NOT NULL
        ),
        'function_name', pg_proc.proname,
        'function_definition', pg_proc.prosrc
    )) AS triggers
FROM
    pg_trigger t
JOIN
    pg_class c ON t.tgrelid = c.oid
JOIN
    pg_namespace n ON c.relnamespace = n.oid
JOIN
    pg_proc ON t.tgfoid = pg_proc.oid
WHERE
    NOT t.tgisinternal
    AND n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema')
GROUP BY
    n.nspname, c.relname
ORDER BY
    n.nspname, c.relname;



-- Sequences List
SELECT
    n.nspname AS schema,                            -- Schema name
    s.relname AS name,                          -- Sequence name
    obj_description(s.oid, 'pg_class') AS comment,       -- Comment on the sequence
    'bigint' AS data_type,                               -- Default data type for sequences in PostgreSQL
    seq.seqstart AS start_value,                         -- Starting value of the sequence
    seq.seqmin AS min_value,                             -- Minimum value
    seq.seqmax AS max_value,                             -- Maximum value
    seq.seqincrement AS increment,                       -- Increment value
    seq.seqcycle AS is_cycled,                           -- Whether the sequence cycles
    last_value,                                          -- Last value of the sequence
    pg_relation_size(s.oid) AS size_bytes,               -- Size of the sequence in bytes
    pg_size_pretty(pg_relation_size(s.oid)) AS size_pretty -- Human-readable size of the sequence
FROM
    pg_class s                                           -- System catalog for relations
JOIN
    pg_namespace n ON n.oid = s.relnamespace             -- Join to get the schema
JOIN
    pg_sequence seq ON s.oid = seq.seqrelid              -- Join to get sequence-specific details
JOIN
    pg_sequences ps ON ps.schemaname = n.nspname AND ps.sequencename = s.relname -- Get last value
WHERE
    s.relkind = 'S'                                      -- 'S' indicates sequences
    AND n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
ORDER BY
    schema, name;                          -- Order by schema and sequence name    


-- Enums List
SELECT
    n.nspname AS schema,                                  -- Schema name
    t.typname AS name,                                    -- Enum type name
    obj_description(t.oid, 'pg_type') AS comment,              -- Enum type comment
    json_agg(e.enumlabel ORDER BY e.enumsortorder) AS values   -- Enum values in order
FROM
    pg_type t
JOIN
    pg_namespace n ON n.oid = t.typnamespace                   -- Join to get schema
JOIN
    pg_enum e ON t.oid = e.enumtypid                           -- Join to get enum values
WHERE
    t.typtype = 'e'                                            -- Only enums
    AND n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
GROUP BY
    n.nspname, t.typname, t.oid                                -- Group by schema and type
ORDER BY
    schema, name;                                    -- Order by schema and type name

-- Ranges List
SELECT
    n.nspname AS schema,                           -- Schema name
    t.typname AS name,                             -- Range type name
    obj_description(t.oid, 'pg_type') AS comment,       -- Comment on the range type
    r.rngsubtype::regtype AS subtype,                   -- Subtype of the range (base type)
    r.rngcollation::regcollation AS collation,          -- Collation for the range type
    r.rngsubopc::regoperator AS subtype_operator_class, -- Operator class for the subtype
    r.rngcanonical::regprocedure AS canonical_function, -- Canonical function
    r.rngsubdiff::regprocedure AS subtype_diff_function -- Subtype difference function
FROM
    pg_type t
JOIN
    pg_range r ON t.oid = r.rngtypid                    -- Join range-specific details
JOIN
    pg_namespace n ON n.oid = t.typnamespace            -- Join to get schema
WHERE
    t.typtype = 'r'                                     -- Only range types
    AND n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
ORDER BY
    schema, name;


-- Functions List
SELECT
    n.nspname AS schema,                                  -- Schema name
    p.proname AS name,                                    -- Function name
    obj_description(p.oid, 'pg_proc') AS comment,         -- Comment on the function (if available)
    pg_catalog.pg_get_function_result(p.oid) AS return, -- Function return type
    pg_catalog.pg_get_function_arguments(p.oid) AS arguments, -- Function arguments
    CASE
        WHEN p.prokind = 'a' THEN 'aggregate'              -- Aggregate function
        WHEN p.prokind = 'w' THEN 'window'                 -- Window function
        WHEN p.prokind = 'f' THEN 'normal'                 -- Regular function
        ELSE 'other'                                       -- Other types
    END AS type,                                  -- Function type
    CASE
        WHEN p.provolatile = 'i' THEN 'immutable'          -- Volatility: Immutable
        WHEN p.provolatile = 's' THEN 'stable'             -- Volatility: Stable
        WHEN p.provolatile = 'v' THEN 'volatile'           -- Volatility: Volatile
    END AS volatility,                                     -- Volatility information
    l.lanname AS language,                                 -- Language of the function
    p.prosrc AS definition                                 -- Function definition/source
FROM
    pg_proc p
JOIN
    pg_namespace n ON n.oid = p.pronamespace               -- Join to get schema
JOIN
    pg_language l ON l.oid = p.prolang                     -- Join to get language
WHERE
    n.nspname NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
    AND p.prokind IN ('f', 'a', 'w')                       -- Include normal, aggregate, and window functions
    AND l.lanname NOT IN ('internal', 'c')                 -- Exclude functions written in 'internal' or 'C' languages
    AND p.proname NOT LIKE 'pg_%'                          -- Exclude functions with 'pg_' prefix (likely built-in)
    AND NOT EXISTS (                                       -- Exclude functions with citext in arguments
        SELECT 1
        FROM unnest(string_to_array(pg_catalog.pg_get_function_arguments(p.oid), ',')) arg
        WHERE arg ILIKE '%citext%'
    )
ORDER BY
    schema, name;
    
    