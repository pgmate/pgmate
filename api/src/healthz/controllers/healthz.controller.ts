import { Controller, Get, Logger, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('healthz')
export class HealthzController {
  private readonly logger = new Logger(HealthzController.name);

  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  @Get('/')
  async healthz(): Promise<{
    success: boolean;
    timestamp: string;
  }> {
    this.logger.log('ping');

    const result = await this.pool.query('SELECT now FROM NOW()');

    return {
      success: true,
      timestamp: result.rows[0]?.now,
    };
  }
}
