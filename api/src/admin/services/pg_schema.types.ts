export interface ServerInfo {
  version: {
    full: string;
    major: number;
    minor: number;
  };
  time: {
    zone: string;
    now: string;
  };
  uptime: {
    startedAt: string;
    seconds: string;
    string: string;
  };
  connections: {
    max: number;
    active: number;
  };
}

export interface CpuInfo {
  max_parallel_workers_per_gather: string;
  max_parallel_workers: string;
  max_worker_processes: string;
}

export interface MemoryInfo {
  shared_buffers: string;
  work_mem: string;
  maintenance_work_mem: string;
  effective_cache_size: string;
  wal_buffers: string;
}

export interface DiskInfo {
  data_size: string;
  wal_size: string;
  wal_segment_size: string;
  max_wal_size: string;
  min_wal_size: string;
  wal_keep_size: string;
}

export interface Extension {
  name: string;
  version: string;
}

export interface DatabaseInfo {
  name: string;
  description: string;
  is_template: boolean;
  owner: string;
  encoding: string;
  collation: string;
  ctype: string;
  size: {
    bytes: string;
    readable: string;
  };
  active_connections: number;
  transactions: {
    committed: number;
    rolled_back: number;
  };
}

export interface Table {
  schema_name: string; // Schema name (e.g., "public")
  table_name: string; // Table name
  comment: string | null; // Table comment, if available
  type: 'r' | 'p' | 'm' | 'v'; // Relation kind: 'r' = table, 'p' = partitioned table, 'm' = materialized view, 'v' = view
  has_partitions: boolean; // True if the table has partitions
  partition_of: string | null; // Parent table if this is a partition, otherwise null
  row_estimate: number; // Estimated number of rows in the table
  total_relation_size: number; // Total size (table + indexes + toast), in bytes
  heap_size: number; // Heap size (data), in bytes
  toast_size: number; // Toast size, in bytes
  indexes_size: number; // Index size, in bytes
}

export interface Column {
  position: number; // Column order
  name: string; // Column name
  comment: string | null; // Column comment, if available
  data_type: string; // Data type of the column
  default_value: string | null; // Default value of the column, if defined
  is_pkey: boolean; // True if the column is part of the primary key
  is_null: boolean; // True if the column allows NULL values
  depends_on: {
    schema: string; // Schema of the referenced table (for foreign key)
    table: string; // Name of the referenced table (for foreign key)
    col: string; // Name of the referenced column (for foreign key)
  } | null; // Null if no foreign key dependency
}

export interface Constraint {
  name: string; // Name of the constraint
  comment: string | null; // Comment associated with the constraint, if available
  type: 'p' | 'f' | 'u' | 'c' | 'x'; // Type of constraint:
  // 'p' = primary key, 'f' = foreign key, 'u' = unique, 'c' = check, 'x' = exclusion
  fkey_info?: {
    schema: string; // Schema of the referenced table (for foreign keys)
    table: string; // Name of the referenced table (for foreign keys)
    columns: string[]; // Columns in the referenced table
  } | null; // Foreign key information, or null if not applicable
  columns: string[]; // Columns involved in the constraint
  definition: string; // Full SQL definition of the constraint
}

export interface Index {
  name: string; // Index name
  comment: string | null; // Comment on the index (if available)
  size_bytes: number; // Index size in bytes
  size_pretty: string; // Index size in human-readable format
  is_unique: boolean; // Whether the index enforces uniqueness
  is_primary: boolean; // Whether the index is a primary key
  definition: string; // Full SQL definition of the index
  columns: string[]; // List of columns used in the index
  access_method: string; // Index access method (e.g., btree, gin)
  validity: 'valid' | 'invalid'; // Index validity status
}

export interface TableColumn {
  schema_name: string; // Name of the schema
  table_name: string; // Name of the table or view
  columns: Column[]; // List of columns in the table or view
}

export interface TableConstraint {
  schema_name: string; // Name of the schema
  table_name: string; // Name of the table
  constraints: Constraint[]; // List of constraints on the table
}

export interface TableIndex {
  schema_name: string; // Name of the schema
  table_name: string; // Name of the table or materialized view
  indexes: Index[];
}

export interface PGSchema {
  server: ServerInfo;
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  extensions: Extension[];
  database: DatabaseInfo;
  tables: Table[];
  columns: TableColumn[];
  constraints: TableConstraint[];
  indexes: TableIndex[];
}