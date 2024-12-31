import { useQuery } from "hooks/use-query";

type TopItem = {
  name: string; // 'table_name', 'index_name', or 'view_name'
  size: number; // Size in bytes
  size_readable: string; // Human-readable size (e.g., '1.2 MB')
};

type SchemaItem = {
  schema_name: string;
  total_size_bytes: number; // Total schema size in bytes
  total_size_readable: string; // Total schema size in human-readable format
  tables_count: number; // Total number of tables
  tables_size_bytes: number; // Total size of all tables in bytes
  tables_size_readable: string; // Total size of all tables in human-readable format
  tables_top: TopItem[]; // Top 3 largest tables
  materialized_views_count: number; // Total number of materialized views
  materialized_views_size_bytes: number; // Total size of all materialized views in bytes
  materialized_views_size_readable: string; // Total size of materialized views in human-readable format
  materialized_views_top: TopItem[]; // Top 3 largest materialized views
  indexes_count: number; // Total number of indexes
  indexes_size_bytes: number; // Total size of all indexes in bytes
  indexes_size_readable: string; // Total size of all indexes in human-readable format
  indexes_top: TopItem[]; // Top 3 largest indexes
  total_views: number; // Total number of views
  total_functions: number; // Total number of functions
};

const GET_SCHEMAS = `
WITH schema_info AS (
  SELECT
    n.nspname AS schema_name,
    (
      SELECT SUM(pg_total_relation_size(c.oid))
      FROM pg_class c
      WHERE c.relnamespace = n.oid
    ) AS total_size,
    COALESCE((
      SELECT SUM(pg_total_relation_size(c.oid))
      FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'r'
    ), 0) AS total_tables_size,
    COALESCE((
      SELECT SUM(pg_total_relation_size(c.oid))
      FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'm'
    ), 0) AS total_materialized_views_size,
    (
      SELECT COUNT(*) 
      FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'i'
    ) AS indexes_count,
    COALESCE((
      SELECT SUM(pg_relation_size(c.oid))
      FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'i'
    ), 0) AS total_indexes_size,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'table_name', t.table_name,
          'size', t.size,
          'size_readable', t.size_readable
        )
      )
      FROM (
        SELECT
          c.relname AS table_name,
          pg_total_relation_size(c.oid) AS size,
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
          END AS size_readable
        FROM pg_class c
        WHERE c.relnamespace = n.oid AND c.relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 3
      ) t
    ), json_build_array()) AS top_tables,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'index_name', i.index_name,
          'size', i.size,
          'size_readable', i.size_readable
        )
      )
      FROM (
        SELECT
          c.relname AS index_name,
          pg_relation_size(c.oid) AS size,
          CASE
            WHEN pg_relation_size(c.oid) < 1024 THEN
              pg_relation_size(c.oid) || ' Bytes'
            WHEN pg_relation_size(c.oid) < 1024 * 1024 THEN
              round(pg_relation_size(c.oid) / 1024.0, 2) || ' KB'
            WHEN pg_relation_size(c.oid) < 1024 * 1024 * 1024 THEN
              round(pg_relation_size(c.oid) / (1024.0 * 1024), 2) || ' MB'
            WHEN pg_relation_size(c.oid) < 1024.0 * 1024 * 1024 * 1024 THEN
              round(pg_relation_size(c.oid) / (1024.0 * 1024 * 1024), 2) || ' GB'
            ELSE
              round(pg_relation_size(c.oid) / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
          END AS size_readable
        FROM pg_class c
        WHERE c.relnamespace = n.oid AND c.relkind = 'i'
        ORDER BY pg_relation_size(c.oid) DESC
        LIMIT 3
      ) i
    ), json_build_array()) AS top_indexes,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'view_name', m.view_name,
          'size', m.size,
          'size_readable', m.size_readable
        )
      )
      FROM (
        SELECT
          c.relname AS view_name,
          pg_total_relation_size(c.oid) AS size,
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
          END AS size_readable
        FROM pg_class c
        WHERE c.relnamespace = n.oid AND c.relkind = 'm'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 3
      ) m
    ), json_build_array()) AS materialized_views_top,
    (
      SELECT COUNT(*) FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'r'
    ) AS total_tables,
    (
      SELECT COUNT(*) FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'v'
    ) AS total_views,
    (
      SELECT COUNT(*) FROM pg_class c
      WHERE c.relnamespace = n.oid AND c.relkind = 'm'
    ) AS total_materialized_views,
    (
      SELECT COUNT(*) FROM pg_proc p
      WHERE p.pronamespace = n.oid
    ) AS total_functions
  FROM pg_namespace n
  --WHERE n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
  --  AND n.nspname != 'information_schema'
)
SELECT
  schema_name,
  total_size AS total_size_bytes,
  CASE
    WHEN total_size < 1024 THEN
      total_size || ' Bytes'
    WHEN total_size < 1024 * 1024 THEN
      round(total_size / 1024.0, 2) || ' KB'
    WHEN total_size < 1024 * 1024 * 1024 THEN
      round(total_size / (1024.0 * 1024), 2) || ' MB'
    WHEN total_size < 1024.0 * 1024 * 1024 * 1024 THEN
      round(total_size / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE
      round(total_size / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS total_size_readable,
  total_tables AS tables_count,
  total_tables_size AS tables_size_bytes,
  CASE
    WHEN total_tables_size < 1024 THEN
      total_tables_size || ' Bytes'
    WHEN total_tables_size < 1024 * 1024 THEN
      round(total_tables_size / 1024.0, 2) || ' KB'
    WHEN total_tables_size < 1024 * 1024 * 1024 THEN
      round(total_tables_size / (1024.0 * 1024), 2) || ' MB'
    WHEN total_tables_size < 1024.0 * 1024 * 1024 * 1024 THEN
      round(total_tables_size / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE
      round(total_tables_size / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS tables_size_readable,
  top_tables AS tables_top,
  total_materialized_views AS materialized_views_count,
  total_materialized_views_size AS materialized_views_size_bytes,
  CASE
    WHEN total_materialized_views_size < 1024 THEN
      total_materialized_views_size || ' Bytes'
    WHEN total_materialized_views_size < 1024 * 1024 THEN
      round(total_materialized_views_size / 1024.0, 2) || ' KB'
    WHEN total_materialized_views_size < 1024 * 1024 * 1024 THEN
      round(total_materialized_views_size / (1024.0 * 1024), 2) || ' MB'
    WHEN total_materialized_views_size < 1024.0 * 1024 * 1024 * 1024 THEN
      round(total_materialized_views_size / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE
      round(total_materialized_views_size / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS materialized_views_size_readable,
  materialized_views_top,
  indexes_count,
  total_indexes_size AS indexes_size_bytes,
  CASE
    WHEN total_indexes_size < 1024 THEN
      total_indexes_size || ' Bytes'
    WHEN total_indexes_size < 1024 * 1024 THEN
      round(total_indexes_size / 1024.0, 2) || ' KB'
    WHEN total_indexes_size < 1024 * 1024 * 1024 THEN
      round(total_indexes_size / (1024.0 * 1024), 2) || ' MB'
    WHEN total_indexes_size < 1024.0 * 1024 * 1024 * 1024 THEN
      round(total_indexes_size / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE
      round(total_indexes_size / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS indexes_size_readable,
  top_indexes AS indexes_top,
  total_views,
  total_functions
FROM schema_info;
`;

export const useSchemas = (conn: Connection): { items: SchemaItem[] } => {
  const { data } = useQuery(conn, GET_SCHEMAS, []);

  // Map and transform the raw rows into the correct types
  const items: SchemaItem[] = (data?.rows || []).map((schema: any) => ({
    schema_name: schema.schema_name,
    total_size_bytes: Number(schema.total_size_bytes),
    total_size_readable: schema.total_size_readable,
    tables_count: Number(schema.tables_count),
    tables_size_bytes: Number(schema.tables_size_bytes),
    tables_size_readable: schema.tables_size_readable,
    tables_top: (schema.tables_top || []).map((table: any) => ({
      name: table.table_name,
      size: Number(table.size),
      size_readable: table.size_readable,
    })), // Map top tables to TopItem type
    materialized_views_count: Number(schema.materialized_views_count),
    materialized_views_size_bytes: Number(schema.materialized_views_size_bytes),
    materialized_views_size_readable: schema.materialized_views_size_readable,
    materialized_views_top: (schema.materialized_views_top || []).map(
      (view: any) => ({
        name: view.view_name,
        size: Number(view.size),
        size_readable: view.size_readable,
      })
    ), // Map top materialized views to TopItem type
    indexes_count: Number(schema.indexes_count),
    indexes_size_bytes: Number(schema.indexes_size_bytes),
    indexes_size_readable: schema.indexes_size_readable,
    indexes_top: (schema.indexes_top || []).map((index: any) => ({
      name: index.index_name,
      size: Number(index.size),
      size_readable: index.size_readable,
    })), // Map top indexes to TopItem type
    total_views: Number(schema.total_views),
    total_functions: Number(schema.total_functions),
  }));

  // Sort schemas based on the rules
  const sortedItems = items.sort((a, b) => {
    if (a.schema_name === "public") return -1; // "public" goes first
    if (b.schema_name === "public") return 1;
    if (
      a.schema_name === "information_schema" ||
      a.schema_name.startsWith("pg_")
    ) {
      if (
        b.schema_name === "information_schema" ||
        b.schema_name.startsWith("pg_")
      ) {
        return a.schema_name.localeCompare(b.schema_name); // Sort among "pg_xxx" or "information_schema"
      }
      return 1; // "information_schema" and "pg_xxx" go last
    }
    if (
      b.schema_name === "information_schema" ||
      b.schema_name.startsWith("pg_")
    ) {
      return -1;
    }
    return a.schema_name.localeCompare(b.schema_name); // Alphabetical for others
  });

  return { items: sortedItems };
};
