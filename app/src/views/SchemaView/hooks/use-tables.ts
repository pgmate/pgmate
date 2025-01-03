import { useQuery } from "hooks/use-query";

const SQL_QUERY = `
WITH table_info AS (
  SELECT
    c.relname AS table_name,
    pg_total_relation_size(c.oid) AS table_size_bytes,
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
    END AS table_size_readable,
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
    n.nspname = $1
    AND c.relkind = 'r'
)
SELECT *
FROM table_info
ORDER BY table_name;
`;

export interface TableItem {
  name: string;
  // table_size_bytes: number;
  size: string;
  columns: number;
  indexes: number;
  // indexes_size_bytes: number;
  index_size: string;
}

export const useTables = (
  conn: Connection,
  schema: string
): { items: TableItem[] } => {
  const { data } = useQuery(conn, SQL_QUERY, [schema]);

  // Map and transform the raw rows into the correct types
  const items: TableItem[] = (data?.rows || []).map((table: any) => ({
    name: table.table_name,
    // table_size_bytes: Number(table.table_size_bytes),
    size: table.table_size_readable,
    columns: Number(table.columns_count),
    indexes: Number(table.indexes_count),
    // indexes_size_bytes: Number(table.indexes_size_bytes),
    index_size: table.indexes_size_readable,
  }));

  return { items };
};
