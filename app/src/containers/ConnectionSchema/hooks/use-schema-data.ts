import { useQueries } from "hooks/use-query";

type TableType = "VIEW" | "BASE TABLE" | "MATERIALIZED VIEW";

interface SchemaInfo {
  schema_name: string;
}

interface TableInfo {
  table_schema: string;
  table_name: string;
  table_type: TableType;
}

export type Schema = {
  name: string;
  tables: { name: string; type: TableType }[];
};

const GET_SCHEMAS = `
SELECT schema_name FROM information_schema.schemata ORDER BY schema_name
`.trim();

const GET_TABLES = `
SELECT 
  table_schema, 
  table_name, 
  table_type 
FROM 
  information_schema.tables

UNION ALL

SELECT 
  schemaname AS table_schema, 
  matviewname AS table_name, 
  'MATERIALIZED VIEW' AS table_type 
FROM 
  pg_matviews
`.trim();

const transformToNestedList = (
  schemas: SchemaInfo[],
  data: TableInfo[]
): Schema[] => {
  // Create a map for schema names to hold tables
  const schemaMap: {
    [key: string]: {
      name: string;
      tables: { name: string; type: TableType }[];
    };
  } = {};

  // Initialize schemaMap with all schemas from the input list
  schemas.forEach(({ schema_name }) => {
    schemaMap[schema_name] = { name: schema_name, tables: [] };
  });

  // Populate schemaMap with tables from the data
  data.forEach(({ table_schema, table_name, table_type }) => {
    if (schemaMap[table_schema]) {
      schemaMap[table_schema].tables.push({
        name: table_name,
        type: table_type,
      });
    }
  });

  // Sort schemas based on the rules
  const sortedSchemas = Object.values(schemaMap).sort((a, b) => {
    if (a.name === "public") return -1; // "public" goes first
    if (b.name === "public") return 1;
    if (a.name === "information_schema" || a.name.startsWith("pg_")) {
      if (b.name === "information_schema" || b.name.startsWith("pg_")) {
        return a.name.localeCompare(b.name); // Sort among "pg_xxx" or "information_schema"
      }
      return 1; // "information_schema" and "pg_xxx" go last
    }
    if (b.name === "information_schema" || b.name.startsWith("pg_")) {
      return -1;
    }
    return a.name.localeCompare(b.name); // Alphabetical for others
  });

  // Sort tables within each schema alphabetically
  sortedSchemas.forEach((schema) => {
    schema.tables.sort((a, b) => a.name.localeCompare(b.name));
  });

  return sortedSchemas;
};

export const useSchemaData = (conn: Connection) => {
  const { data, refetch } = useQueries(conn, [
    {
      statement: GET_SCHEMAS,
      variables: [],
    },
    {
      statement: GET_TABLES,
      variables: [],
    },
  ]);

  const schema = data
    ? transformToNestedList(
        data[0].rows as SchemaInfo[],
        data[1].rows as TableInfo[]
      )
    : [];

  return {
    schema,
    refetch,
  };
};
