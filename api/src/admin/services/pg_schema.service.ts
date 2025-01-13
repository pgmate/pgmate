import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { ConnectionsService } from '../services/connections.service';
import * as queries from './pg_schema.queries';
import { PGSchema } from './pg_schema.types';

@Injectable()
export class PGSchemaService {
  private readonly logger = new Logger(PGSchemaService.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  private async getServerInfo(client: Client): Promise<PGSchema['server']> {
    const { rows } = await client.query(queries.SERVER_INFO);
    return {
      version: {
        full: rows[0].version_full,
        major: rows[0].version_major,
        minor: rows[0].version_minor,
      },
      time: {
        zone: rows[0].timezone,
        now: rows[0].now,
      },
      uptime: {
        startedAt: rows[0].instance_start_time,
        seconds: rows[0].uptime,
        string: rows[0].uptime_txt,
      },
      connections: {
        max: rows[0].max_connections,
        active: rows[0].active_connections,
      },
    };
  }

  private async getCpuInfo(client: Client): Promise<PGSchema['cpu']> {
    const { rows } = await client.query(queries.CPU_INFO);
    return rows[0];
  }

  private async getMemoryInfo(client: Client): Promise<PGSchema['memory']> {
    const { rows } = await client.query(queries.MEMORY_INFO);
    return rows[0];
  }

  private async getDiskInfo(client: Client): Promise<PGSchema['disk']> {
    const { rows } = await client.query(queries.DISK_INFO);
    return rows[0];
  }

  private async getExtensions(client: Client): Promise<PGSchema['extensions']> {
    const { rows } = await client.query(queries.EXTENSIONS_LIST);
    return rows;
  }

  private async getDatabaseInfo(client: Client): Promise<PGSchema['database']> {
    const { rows } = await client.query(queries.DATABASE_INFO);
    return rows[0];
  }

  private async getTables(client: Client): Promise<PGSchema['tables']> {
    const { rows } = await client.query(queries.TABLES_LIST);
    return rows;
  }

  private async getColumns(client: Client): Promise<PGSchema['columns']> {
    const { rows } = await client.query(queries.COLUMNS_LIST_BY_TABLE);
    return rows;
  }

  private async getConstraints(
    client: Client,
  ): Promise<PGSchema['constraints']> {
    const { rows } = await client.query(queries.CONSTRAINTS_LIST_BY_TABLE);
    return rows;
  }

  private async getIndexes(client: Client): Promise<PGSchema['indexes']> {
    const { rows } = await client.query(queries.INDEXES_LIST_BY_TABLE);
    return rows;
  }

  private async getSequences(client: Client): Promise<PGSchema['sequences']> {
    const { rows } = await client.query(queries.SEQUENCES_LIST);
    return rows;
  }

  async getSchema(client: Client): Promise<PGSchema> {
    const [
      server,
      cpu,
      memory,
      disk,
      extensions,
      database,
      tables,
      columns,
      constraints,
      indexes,
      sequences,
    ] = await Promise.all([
      this.getServerInfo(client),
      this.getCpuInfo(client),
      this.getMemoryInfo(client),
      this.getDiskInfo(client),
      this.getExtensions(client),
      this.getDatabaseInfo(client),
      this.getTables(client),
      this.getColumns(client),
      this.getConstraints(client),
      this.getIndexes(client),
      this.getSequences(client),
    ]);

    return {
      server,
      cpu,
      memory,
      disk,
      extensions,
      database,
      tables,
      columns,
      constraints,
      indexes,
      sequences,
    };
  }
}
