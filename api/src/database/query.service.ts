import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, QueryResult } from 'pg';

@Injectable()
export class QueryService implements OnModuleDestroy {
  private default: Client | null = null;
  private lastQueryTime: number | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly logger = new Logger(QueryService.name);
  private clientInitPromise: Promise<Client> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async createClient(): Promise<Client> {
    try {
      const connectionString = this.configService.get<string>('PGSTRING');
      const client = new Client({ connectionString });
      await client.connect();
      this.logger.log('Database client connected.');
      return client;
    } catch (error) {
      throw new Error(
        `Failed to connect to the default client: ${error.message}`,
      );
    }
  }

  private async getOrCreateClient(): Promise<Client> {
    if (this.default) {
      return this.default;
    }

    // If client initialization is already in progress, wait for it to finish
    if (!this.clientInitPromise) {
      this.clientInitPromise = this.createClient();
      this.clientInitPromise.finally(() => {
        // Clear the promise once initialization is complete (successful or failed)
        this.clientInitPromise = null;
      });
    }

    this.default = await this.clientInitPromise;
    return this.default;
  }

  private scheduleDisconnect() {
    // Clear any existing timers
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    // Schedule client disconnection after 30 seconds of inactivity
    this.cleanupTimer = setTimeout(async () => {
      if (this.default) {
        try {
          await this.default.end();
          this.logger.log(
            `Database client disconnected after 30 seconds of inactivity. Last query time: ${
              this.lastQueryTime
                ? new Date(this.lastQueryTime).toISOString()
                : 'N/A'
            }`,
          );
          this.default = null;
          this.lastQueryTime = null;
        } catch (error) {
          this.logger.error('Error disconnecting the client:', error.message);
        }
      }
    }, 30000); // 30 seconds
  }

  public async query<T = any>(
    sql: string,
    variables: any[] = [],
  ): Promise<QueryResult<T>> {
    const client = await this.getOrCreateClient();

    this.lastQueryTime = Date.now();
    const result = await client.query<T>(sql, variables);

    // Schedule disconnection after the query
    this.scheduleDisconnect();

    // this.logger.debug(
    //   `Query executed at ${new Date(this.lastQueryTime).toISOString()}: ${sql}`,
    // );

    return result;
  }

  // Ensure cleanup on module destroy
  async onModuleDestroy() {
    if (this.default) {
      try {
        await this.default.end();
        this.logger.log('Database client disconnected during module cleanup.');
      } catch (error) {
        this.logger.error('Error during module cleanup:', error.message);
      }
    }
  }
}
