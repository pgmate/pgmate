import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { RemoteDataService } from '../shared/services/remote-data.service';
import { QueryService } from './query.service';
import { ClientService } from './client.service';

@Module({
  providers: [ClientService, QueryService, MigrationService, RemoteDataService],
  exports: [ClientService],
})
export class DatabaseModule {}
