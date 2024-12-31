WITH view_definitions AS (
  SELECT
    viewname AS view_name,
    definition AS view_definition
  FROM pg_views
  WHERE schemaname = 'public'
)
SELECT
  view_name,
  STRING_AGG(
    DISTINCT t_ns.nspname || '.' || t.relname,
    ', '
  ) AS depends_on
FROM view_definitions vd
LEFT JOIN pg_class t ON position(t.relname IN vd.view_definition) > 0
LEFT JOIN pg_namespace t_ns ON t.relnamespace = t_ns.oid
WHERE t.relkind = 'r'
GROUP BY view_name;