import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HealthzController } from './controllers/healthz.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthzController],
  providers: [],
})
export class HealthzModule {}
