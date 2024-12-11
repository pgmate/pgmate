import { Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { databaseProviders } from './database.providers';
import { MigrationService } from './migration.service';

@Module({
  providers: [...databaseProviders, MigrationService],
  exports: [...databaseProviders],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  async onApplicationShutdown(signal?: string) {
    await this.pool.end();
    console.log('Database connection pool has been closed');
  }
}
