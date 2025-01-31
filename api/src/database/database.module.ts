import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { QueryService } from './query.service';
import { ClientService } from './client.service';

@Module({
  providers: [ClientService, QueryService, MigrationService],
  exports: [ClientService],
})
export class DatabaseModule {}
