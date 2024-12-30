WITH view_definitions AS (
  SELECT
    viewname AS view_name,
    definition AS view_definition
  FROM pg_views
  WHERE schemaname = 'public'
)
SELECT
  view_name,
  json_agg(
    DISTINCT json_build_object(
      'schema', t_ns.nspname,
      'table', t.relname
    )::text
  )::json AS dependent_tables
FROM view_definitions vd
LEFT JOIN pg_class t ON position(t.relname IN vd.view_definition) > 0
LEFT JOIN pg_namespace t_ns ON t.relnamespace = t_ns.oid
WHERE t.relkind = 'r'
GROUP BY view_name;