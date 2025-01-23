import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../database/database.module';
import { AdminGuard } from './admin.guard';
import { AdminController } from './controllers/admin.controller';
import { ConnectionsController } from './controllers/connections.controller';
import { QueryController } from './controllers/query.controller';
import { PGDumpController } from './controllers/pg_dump.controller';
import { PGSchemaController } from './controllers/pg_schema.controller';
import { AIController } from './controllers/ai.controller';
import { ConnectionsService } from './services/connections.service';
import { PGDumpService } from './services/pg_dump.service';
import { PGSchemaService } from './services/pg_schema.service';
import { AIService } from './services/ai.service';

@Module({
  imports: [HttpModule, ConfigModule, DatabaseModule],
  controllers: [
    AdminController,
    ConnectionsController,
    QueryController,
    PGDumpController,
    PGSchemaController,
    AIController,
  ],
  providers: [
    AdminGuard,
    ConnectionsService,
    PGDumpService,
    PGSchemaService,
    AIService,
  ],
})
export class AdminModule {}
