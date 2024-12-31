import { useQuery } from "../../../hooks/use-query";

const SQL_QUERY = `
WITH view_definitions AS (
  SELECT
    viewname AS view_name,
    definition AS view_definition
  FROM pg_views
  WHERE schemaname = $1
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
`;

export interface ViewItem {
  name: string; // Name of the view
  depends_on: string | null; // Comma-separated list of {schema}.{table} or null
}

export const useViews = (
  conn: Connection,
  schema: string
): { items: ViewItem[] } => {
  const { data } = useQuery(conn, SQL_QUERY, [schema]);

  // Map and transform the raw rows into the correct types
  const items: ViewItem[] = (data?.rows || []).map((view: any) => ({
    name: view.view_name,
    depends_on: view.depends_on || null, // If no dependencies, set as null
  }));

  return { items };
};
