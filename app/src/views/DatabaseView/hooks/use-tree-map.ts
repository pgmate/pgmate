import { useQuery } from "hooks/use-query";

export type TreeNodeItem = {
  name: string; // Node name (schema, table, or partition)
  children?: TreeNodeItem[]; // Child nodes (tables under schemas, partitions under tables)
  total_size?: number;
  data_size?: number;
  heap_size?: number;
  toast_size?: number;
  index_size?: number;
  value?: number; // Derived value for Sunburst chart
};

export type TreeNode = {
  name: string; // Root node name (database name)
  children: TreeNodeItem[]; // Child nodes (schemas)
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
  CASE 
    WHEN type = 'p' THEN (
      SELECT parent_namespace.nspname || '.' || parent_table.relname
      FROM pg_inherits
      JOIN pg_class parent_table ON pg_inherits.inhparent = parent_table.oid
      JOIN pg_namespace parent_namespace ON parent_table.relnamespace = parent_namespace.oid
      WHERE pg_inherits.inhrelid = final_data.table_oid
    )
    ELSE type
  END AS type, -- Replace type for child partitions
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
WHERE "schema" NOT IN ('pg_toast1', 'pg_catalog1', 'information_schema1') -- Exclude system schemas
`;

export const useTreeMap = (conn: Connection): { items: TreeNode } => {
  const { data } = useQuery(conn, SQL_QUERY, []);

  const items = (data?.rows || [])
    .filter(
      (row: any) =>
        row.schema !== "information_schema" && !row.schema.startsWith("pg_")
    )
    .map((row: any) => ({
      schema: row.schema,
      table_name: row.table_name,
      type: row.type,
      total_size: Number(row.total_size),
      data_size: Number(row.data_size),
      heap_size: Number(row.heap_size),
      toast_size: Number(row.toast_size),
      index_size: Number(row.index_size),
    }));

  // console.log("items", items);

  const treeMapData: TreeNode = {
    name: conn.database,
    children: Object.entries(
      items.reduce<Record<string, TreeNodeItem>>((schemas, item) => {
        // Ensure schema node exists
        if (!schemas[item.schema]) {
          schemas[item.schema] = {
            name: item.schema,
            children: [],
          };
        }
        const schemaNode = schemas[item.schema];

        if (item.type === "P") {
          // Check if the partitioned table already exists
          let tableNode = schemaNode.children?.find(
            (child) => child.name === item.table_name
          );
          if (!tableNode) {
            // Create partitioned table node if it doesn't exist
            tableNode = {
              name: item.table_name,
              children: [],
            };
            schemaNode.children?.push(tableNode);
          }
        } else if (typeof item.type === "string" && item.type.includes(".")) {
          // Handle partitions (type contains "schema.table_name")
          const [parentSchema, parentTableName] = item.type.split(".");
          if (parentSchema === item.schema) {
            // Find or create the parent table node
            let parentTableNode = schemaNode.children?.find(
              (table) => table.name === parentTableName
            );
            if (!parentTableNode) {
              // Create parent table node if it doesn't exist
              parentTableNode = {
                name: parentTableName,
                children: [],
              };
              schemaNode.children?.push(parentTableNode);
            }
            // Add the partition as a child of the parent table
            parentTableNode.children?.push({
              name: `${item.schema}.${item.table_name}`,
              total_size: item.total_size,
              data_size: item.data_size,
              heap_size: item.heap_size,
              toast_size: item.toast_size,
              index_size: item.index_size,
            });
          }
        } else {
          // Handle regular tables and materialized views
          schemaNode.children?.push({
            name: `${item.schema}.${item.table_name}`,
            total_size: item.total_size,
            data_size: item.data_size,
            heap_size: item.heap_size,
            toast_size: item.toast_size,
            index_size: item.index_size,
          });
        }

        return schemas;
      }, {})
    ).map(([_, schemaNode]) => {
      // If a node has children, omit its values
      if (schemaNode.children?.length) {
        return {
          name: schemaNode.name,
          children: schemaNode.children,
        };
      }
      return schemaNode;
    }), // Convert schema map to array
  };

  return { items: treeMapData };
};
