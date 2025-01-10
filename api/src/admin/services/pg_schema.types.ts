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

export interface ExtensionInfo {
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

export interface PGSchema {
  server: ServerInfo;
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  extensions: ExtensionInfo[];
  database: DatabaseInfo;
}
