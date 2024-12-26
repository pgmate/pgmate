import { useQuery } from "../../../hooks/use-query";

interface DatabaseItem {
  name: string; // Name of the database
  description: string | null; // Description of the database (can be null if no description is set)
  is_selected: boolean; // Indicates if this is the currently selected database
  is_template: boolean; // Indicates if this database is a template
  owner: string; // Owner of the database
  encoding: string; // Encoding used by the database (e.g., UTF8)
  collation: string; // Collation settings of the database (e.g., en_US.UTF-8)
  size_bytes: number; // Size of the database in bytes
  size_readable: string; // Human-readable size (e.g., "10 MB")
  active_connections: number; // Number of active connections to the database
  committed_ts: number; // Total committed transactions
  rolled_back_ts: number; // Total rolled-back transactions
  health_factor: number; // Health factor (e.g., 1.00 means no rollbacks)
  health_rate: "green" | "yellow" | "red"; // Health indicator based on thresholds
}

const GET_DATABASES = `
WITH current_db AS (
  SELECT current_database() AS current_database
)
SELECT 
  d.datname AS "name",
  sd.description AS "description",
  (d.datname = (SELECT current_database FROM current_db)) AS "is_selected",
  d.datistemplate AS "is_template",
  pg_catalog.pg_get_userbyid(d.datdba) AS "owner",
  pg_encoding_to_char(d.encoding) AS "encoding",
  d.datcollate AS "collation",
  pg_database_size(d.datname) AS "size_bytes",
  CASE
    WHEN pg_database_size(d.datname) < 1024 THEN 
      pg_database_size(d.datname) || ' Bytes'
    WHEN pg_database_size(d.datname) < 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / 1024.0, 2) || ' KB'
    WHEN pg_database_size(d.datname) < 1024 * 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / (1024.0 * 1024), 2) || ' MB'
    WHEN pg_database_size(d.datname) < 1024.0 * 1024 * 1024 * 1024 THEN 
      round(pg_database_size(d.datname) / (1024.0 * 1024 * 1024), 2) || ' GB'
    ELSE 
      round(pg_database_size(d.datname) / (1024.0 * 1024 * 1024 * 1024), 2) || ' TB'
  END AS "size_readable",
  s.numbackends AS "active_connections",
  s.xact_commit AS "committed_ts",
  s.xact_rollback AS "rolled_back_ts",
  CASE 
    WHEN (xact_commit + xact_rollback) > 0 THEN 
      1 - round(100.0 * xact_rollback / (xact_commit + xact_rollback), 2)
    ELSE 
      1.00
  END AS "health_factor",
  CASE 
    WHEN (xact_commit + xact_rollback) = 0 THEN 'green'  -- No transactions = perfect health
    WHEN (1 - round(100.0 * xact_rollback / (xact_commit + xact_rollback), 2)) >= 0.95 THEN 'green'
    WHEN (1 - round(100.0 * xact_rollback / (xact_commit + xact_rollback), 2)) >= 0.85 THEN 'yellow'
    ELSE 'red'
  END AS "health_rate"
FROM 
  pg_database d
LEFT JOIN 
  pg_shdescription sd ON d.oid = sd.objoid
LEFT JOIN 
  pg_stat_database s ON d.datname = s.datname;
`;

export const useDatabases = (conn: string): { items: DatabaseItem[] } => {
  const { data } = useQuery(conn, GET_DATABASES, []);

  // Map and transform the raw rows into the correct types
  const items: DatabaseItem[] = (data?.rows || []).map((db: any) => ({
    name: db.name, // Already a string
    description: db.description || null, // Convert undefined to null
    is_selected: db.is_selected === "true", // Convert string "true"/"false" to boolean
    is_template: db.is_template === "true", // Convert string "true"/"false" to boolean
    owner: db.owner, // Already a string
    encoding: db.encoding, // Already a string
    collation: db.collation, // Already a string
    size_bytes: Number(db.size_bytes), // Convert string to number
    size_readable: db.size_readable, // Already a string
    active_connections: Number(db.active_connections), // Convert string to number
    committed_ts: Number(db.committed_ts), // Convert string to number
    rolled_back_ts: Number(db.rolled_back_ts), // Convert string to number
    health_factor: Number(db.health_factor), // Convert string to number
    health_rate: db.health_rate as "green" | "yellow" | "red", // Ensure valid health rate value
  }));

  console.log(items);

  return { items };
};
