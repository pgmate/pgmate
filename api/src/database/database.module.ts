import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { ClientService } from './client.service';

@Module({
  providers: [MigrationService, ClientService],
  exports: [ClientService],
})
export class DatabaseModule {}
