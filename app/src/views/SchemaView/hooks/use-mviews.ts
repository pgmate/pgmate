import { useQuery } from "../../../hooks/use-query";
import { Connection } from "../../../providers/ConnectionProvider";
export type { Connection } from "../../../providers/ConnectionProvider";

const SQL_QUERY = `
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
    END AS indexes_size_readable,
    (
      SELECT STRING_AGG(
        DISTINCT t_ns.nspname || '.' || t.relname, ', '
      )
      FROM pg_class t
      JOIN pg_namespace t_ns ON t.relnamespace = t_ns.oid
      WHERE position(t.relname IN pg_get_viewdef(c.oid, true)) > 0
    ) AS depends_on
  FROM
    pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE
    n.nspname = $1
    AND c.relkind = 'm'
)
SELECT *
FROM materialized_view_info
ORDER BY view_name;
`;

export interface MViewItem {
  name: string; // Name of the materialized view
  size: string; // Human-readable size of the view
  columns: number; // Number of columns
  indexes: number; // Number of indexes
  index_size: string; // Human-readable size of indexes
  depends_on: string | null; // Comma-separated list of dependencies or null
}

export const useMViews = (
  conn: Connection,
  schema: string
): { items: MViewItem[] } => {
  const { data } = useQuery(conn, SQL_QUERY, [schema]);

  // Map and transform the raw rows into the correct types
  const items: MViewItem[] = (data?.rows || []).map((view: any) => ({
    name: view.view_name,
    size: view.view_size_readable,
    columns: Number(view.columns_count),
    indexes: Number(view.indexes_count),
    index_size: view.indexes_size_readable,
    depends_on: view.depends_on || null, // If no dependencies, set as null
  }));

  return { items };
};
