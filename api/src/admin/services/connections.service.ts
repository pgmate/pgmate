import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool, Client } from 'pg';
import { performance } from 'perf_hooks';
import { EncryptionService } from '../../shared/services/encryption.service';
import { parsePGString } from '../../database/utils/parse-pgstring';

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
      database: string;
      username: string;
      ssl: boolean;
      created_at: Date;
      updated_at: Date;
    }[]
  > {
    const { rows } = await this.pool.query(
      'SELECT "name", "desc", "ssl", "conn", "created_at", "updated_at" FROM "pgmate"."connections" ORDER BY "name"',
    );
    return rows.map((row) => {
      try {
        // Decrypt the connection string
        const decryptedConn = this.encryptionService.decrypt(row.conn);

        // Parse the connection string to extract details
        const { database, user } = parsePGString(decryptedConn);

        return {
          ...row,
          database, // Extracted database name
          username: user, // Extracted username
        };
      } catch (error) {
        this.logger.error(
          `Failed to decrypt or parse connection string for connection: ${row.name}`,
          error,
        );
        throw new Error(`Failed to process connection: ${row.name}`);
      }
    });
  }

  async getConnection(name: string): Promise<{
    name: string;
    desc: string | null;
    conn: string;
    ssl: boolean;
    created_at: Date;
    updated_at: Date;
  }> {
    const { rows } = await this.pool.query(
      'SELECT "name", "desc", "ssl", "conn", "created_at", "updated_at" FROM "pgmate"."connections" WHERE "name" = $1',
      [name],
    );

    if (rows.length === 0) {
      throw new Error(`Connection with name "${name}" not found`);
    }

    const connection = rows[0];
    const decrypted = this.encryptionService.decrypt(connection.conn);

    return {
      ...connection,
      conn: parsePGString(decrypted),
    };
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

  async createClient(
    name: string,
    database?: string,
  ): Promise<[Client, string, string]> {
    const timerStart = performance.now();
    const { conn, ssl } = await this.getConnectionDetails(name);

    if (!conn) {
      throw new Error(`Connection with name "${name}" not found`);
    }

    // Decrypt the connection string
    const decryptedConn = this.encryptionService.decrypt(conn);

    // Parse the connection string
    const url = new URL(decryptedConn);

    // Replace the database in the connection string if the `database` parameter is provided
    if (database) {
      url.pathname = `/${database}`;
    }

    // Final connection string with optional database override
    const connectionString = url.toString();

    // Create a new client with the updated connection string
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
