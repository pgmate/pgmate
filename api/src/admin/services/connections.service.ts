import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool, Client } from 'pg';
import { performance } from 'perf_hooks';
import { EncryptionService } from '../../shared/services/encryption.service';

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private readonly encryptionService: EncryptionService,
  ) {}

  async listConnections(): Promise<
    {
      name: string;
      desc: string | null;
      ssl: boolean;
      created_at: Date;
      updated_at: Date;
    }[]
  > {
    const { rows } = await this.pool.query(
      'SELECT "name", "desc", "ssl", "created_at", "updated_at" FROM "pgmate"."connections" ORDER BY "name"',
    );
    return rows;
  }

  async upsertConnection(
    name: string,
    pgstring: string,
    ssl = false,
    description?: string | null,
  ): Promise<void> {
    await this.pool.query(
      'INSERT INTO "pgmate"."connections" ("name", "desc", "conn", "ssl") VALUES ($1, $2, $3, $4) ON CONFLICT ("name") DO UPDATE SET "desc" = $2, "conn" = $3, "ssl" = $4, updated_at = NOW()',
      [name, description, this.encryptionService.encrypt(pgstring), ssl],
    );
  }

  // Helper: Retrieve connection details from the database
  private async getConnectionDetails(name: string) {
    const { rows } = await this.pool.query(
      'SELECT "conn", "ssl" FROM "pgmate"."connections" WHERE "name" = $1',
      [name],
    );
    return rows[0];
  }

  async createClient(name: string): Promise<[Client, string, string]> {
    const timerStart = performance.now();
    const { conn, ssl } = await this.getConnectionDetails(name);

    if (!conn) {
      throw new Error(`Connection with name "${name}" not found`);
    }

    // Decrypt the connection string and create a client
    const connectionString = this.encryptionService.decrypt(conn);
    const client = new Client({
      connectionString,
      ssl: ssl ? { rejectUnauthorized: false } : false,
    });

    // Connect to the database
    await client.connect();

    const timerEnd = performance.now();
    return [
      client,
      `${(timerEnd - timerStart).toFixed(3)} ms`,
      connectionString,
    ];
  }
}
