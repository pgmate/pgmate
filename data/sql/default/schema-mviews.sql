WITH materialized_view_info AS (
  SELECT
    c.relname AS view_name,
    pg_total_relation_size(c.oid) AS view_size_bytes,
    CASE
      WHEN pg_total_relation_size(c.oid) < 1024 THEN
        pg_total_relation_size(c.oid) || ' Bytes'
      WHEN pg_total_relation_size(c.oid) < 1024 * 1024 THEN
        round(pg_total_relation_size(c.oid) / 1024.0, 2) || ' KB'
      WHEN pg_total_relation_size(c.oid) < 1024 * 1024 * 1024 THEN
        round(pg_total_relation_size(c.oid) / (1024.0 * 1024), 2) || ' MB'
      WHEN pg_total_relation_size(c.oid) < 1024.0 * 1024 * 1024 * 1024 THEN
        round(pg_total_relation_size(c.oid) / (1024.0 * 1024 * 1024), 2) || ' GB'
      ELSE
        round(pg_total_relation_size(c.oid) / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
    END AS view_size_readable,
    (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_schema = n.nspname AND table_name = c.relname
    ) AS columns_count,
    (
      SELECT COUNT(*)
      FROM pg_index i
      WHERE i.indrelid = c.oid
    ) AS indexes_count,
    (
      SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
      FROM pg_index i
      WHERE i.indrelid = c.oid
    ) AS indexes_size_bytes,
    CASE
      WHEN (
        SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
        FROM pg_index i
        WHERE i.indrelid = c.oid
      ) < 1024 THEN
        (
          SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
          FROM pg_index i
          WHERE i.indrelid = c.oid
        ) || ' Bytes'
      WHEN (
        SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
        FROM pg_index i
        WHERE i.indrelid = c.oid
      ) < 1024 * 1024 THEN
        round((
          SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
          FROM pg_index i
          WHERE i.indrelid = c.oid
        ) / 1024.0, 2) || ' KB'
      WHEN (
        SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
        FROM pg_index i
        WHERE i.indrelid = c.oid
      ) < 1024 * 1024 * 1024 THEN
        round((
          SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
          FROM pg_index i
          WHERE i.indrelid = c.oid
        ) / (1024.0 * 1024), 2) || ' MB'
      WHEN (
        SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
        FROM pg_index i
        WHERE i.indrelid = c.oid
      ) < 1024.0 * 1024 * 1024 * 1024 THEN
        round((
          SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
          FROM pg_index i
          WHERE i.indrelid = c.oid
        ) / (1024.0 * 1024 * 1024), 2) || ' GB'
      ELSE
        round((
          SELECT COALESCE(SUM(pg_relation_size(i.indexrelid)), 0)
          FROM pg_index i
          WHERE i.indrelid = c.oid
        ) / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
    END AS indexes_size_readable
  FROM
    pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE
    n.nspname = 'public'
    AND c.relkind = 'm'
)
SELECT *
FROM materialized_view_info
ORDER BY view_name;
