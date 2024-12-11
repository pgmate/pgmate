import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { AdminGuard } from './admin.guard';
import { AdminController } from './controllers/admin.controller';
import { ConnectionsController } from './controllers/connections.controller';
import { QueryController } from './controllers/query.controller';
import { PGDumpController } from './controllers/pg_dump.controller';
import { ConnectionsService } from './services/connections.service';
import { PGDumpService } from './services/pg_dump.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [
    AdminController,
    ConnectionsController,
    QueryController,
    PGDumpController,
  ],
  providers: [AdminGuard, ConnectionsService, PGDumpService],
})
export class AdminModule {}
