/**
 * This service is instanciated via the ClientInterceptor
 * It creates a request-scoped client connection to the database for both the default and the target client
 *
 * NOTE: the default client is obsolete and should be replaced by the QueryService
 */

import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { EncryptionService } from '../shared/services/encryption.service';

@Injectable({ scope: Scope.REQUEST })
export class ClientService {
  public default: Client | null = null;
  public target: Client | null = null;

  // LEGACY: This is used by the "pg_dump" service (with child process)
  public dangerouslyExposeTargetConnectionString: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private async getConnectionString(
    conn: string,
    db?: string,
  ): Promise<string> {
    const { rows } = await this.default.query(
      'SELECT "conn", "ssl" FROM "pgmate"."connections" WHERE "name" = $1',
      [conn],
    );
    const decryptedConn = this.encryptionService.decrypt(rows[0].conn);

    // Apply the requested database if provided
    const url = new URL(decryptedConn);
    if (db) {
      url.pathname = `/${db}`;
    }
    if (url.pathname.trim() === '/') {
      url.pathname = `/${url.username}`;
    }

    return url.toString();
  }

  async createClients(conn?: string, db?: string): Promise<void> {
    // Establish connection with the default client:
    if (!this.default) {
      try {
        const connectionString = this.configService.get<string>('PGSTRING');
        this.default = new Client({ connectionString });
        this.dangerouslyExposeTargetConnectionString = connectionString;
        await this.default.connect();
      } catch (error) {
        throw new Error(
          `Failed to connect to the default client: ${error.message}`,
        );
      }
    }

    // Skip target connection if not requested
    if (!conn) return;

    // Establish connection with the target client:
    if (!this.target) {
      try {
        const targetConn = await this.getConnectionString(conn, db);
        this.target = new Client({ connectionString: targetConn });
        await this.target.connect();
      } catch (error) {
        throw new Error(
          `Failed to connect to the target client: ${error.message}`,
        );
      }
    }
  }

  async dropClients(): Promise<void> {
    await this.default?.end();
    await this.target?.end();
  }
}
