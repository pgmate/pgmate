import { useQuery } from "hooks/use-query";

type TableSizeItem = {
  schema: string; // Schema name
  table_name: string; // Table name
  type: "P" | "r" | "m"; // Type: P = Partitioned table, r = Regular table, m = Materialized view
  total_size: number; // Total size in bytes
  data_size: number; // Data size (Heap + TOAST) in bytes
  heap_size: number; // Heap size in bytes
  toast_size: number; // TOAST size in bytes
  index_size: number; // Index size in bytes
  free_space: number; // Free space in bytes
};

const SQL_QUERY = `
WITH partition_data AS (
  SELECT 
    n.nspname AS "schema",
    c.relname AS "table_name",
    c.oid AS table_oid, -- Include the table OID for use in later joins
    pg_total_relation_size(c.oid) AS total_size, -- Total size including everything
    pg_table_size(c.oid) AS data_size, -- Heap + TOAST
    pg_relation_size(c.oid) AS heap_size, -- Heap only
    pg_table_size(c.oid) - pg_relation_size(c.oid) AS toast_size, -- TOAST only
    pg_indexes_size(c.oid) AS index_size, -- All indexes
    pg_total_relation_size(c.oid) - (
      pg_relation_size(c.oid) + 
      pg_table_size(c.oid) - pg_relation_size(c.oid) + 
      pg_indexes_size(c.oid)
    ) AS free_space, -- Free space
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM pg_inherits WHERE inhrelid = c.oid
      ) AND EXISTS (
        SELECT 1 FROM pg_inherits WHERE inhparent = c.oid
      ) THEN 'P' -- Main partitioned table
      WHEN EXISTS (
        SELECT 1 FROM pg_inherits WHERE inhrelid = c.oid
      ) THEN 'p' -- Child partition
      WHEN c.relkind = 'm' THEN 'm' -- Materialized view
      ELSE 'r' -- Regular table
    END AS type -- Add type column
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'm') -- Include only regular tables and materialized views
),
aggregated_partitions AS (
  SELECT
    parent_table.relname AS table_name,
    parent_namespace.nspname AS "schema",
    NULL AS table_oid, -- Placeholder to match column structure
    'P' AS type,
    SUM(pg_total_relation_size(child_table.oid)) AS total_size,
    SUM(pg_table_size(child_table.oid)) AS data_size,
    SUM(pg_relation_size(child_table.oid)) AS heap_size,
    SUM(pg_table_size(child_table.oid) - pg_relation_size(child_table.oid)) AS toast_size,
    SUM(pg_indexes_size(child_table.oid)) AS index_size,
    SUM(pg_total_relation_size(child_table.oid)) - (
      SUM(pg_relation_size(child_table.oid)) + 
      SUM(pg_table_size(child_table.oid) - pg_relation_size(child_table.oid)) + 
      SUM(pg_indexes_size(child_table.oid))
    ) AS free_space -- Calculate free space for aggregated partitions
  FROM pg_inherits
  JOIN pg_class child_table ON pg_inherits.inhrelid = child_table.oid
  JOIN pg_class parent_table ON pg_inherits.inhparent = parent_table.oid
  JOIN pg_namespace parent_namespace ON parent_table.relnamespace = parent_namespace.oid
  WHERE child_table.relkind = 'r' -- Ensure only tables (not indexes) are included
  GROUP BY parent_table.relname, parent_namespace.nspname
)
SELECT 
  "schema",
  table_name,
  type,
  total_size,
  data_size,
  heap_size,
  toast_size,
  index_size,
  free_space
FROM (
  SELECT 
    "schema", table_name, table_oid, type, total_size, data_size, heap_size, toast_size, index_size, free_space
  FROM partition_data
  UNION ALL
  SELECT 
    "schema", table_name, NULL AS table_oid, type, total_size, data_size, heap_size, toast_size, index_size, free_space
  FROM aggregated_partitions
) AS final_data
where "schema" NOT IN ('pg_toast', 'pg_catalog', 'information_schema') -- Exclude system schemas
  and "type" not in ('p') -- Exclude child partitions
order by total_size desc;
`;

export const useTableSize = (conn: Connection): { items: TableSizeItem[] } => {
  const { data } = useQuery(conn, SQL_QUERY, []);

  // Map and transform the raw rows into the correct types
  const items: TableSizeItem[] = (data?.rows || []).map((row: any) => ({
    schema: row.schema, // Schema name
    table_name: row.table_name, // Table name
    type: row.type, // Table type (P, r, m)
    total_size: Number(row.total_size), // Total size in bytes
    data_size: Number(row.data_size), // Data size in bytes
    heap_size: Number(row.heap_size), // Heap size in bytes
    toast_size: Number(row.toast_size), // TOAST size in bytes
    index_size: Number(row.index_size), // Index size in bytes
    free_space: Number(row.free_space), // Free space in bytes
  }));

  return { items };
};
