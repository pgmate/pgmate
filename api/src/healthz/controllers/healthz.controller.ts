import { Controller, Get, Logger, UseInterceptors } from '@nestjs/common';
import { ClientInterceptor } from '../../database/client.interceptor';
import { ClientService } from '../../database/client.service';

@UseInterceptors(ClientInterceptor)
@Controller('healthz')
export class HealthzController {
  private readonly logger = new Logger(HealthzController.name);

  constructor(private readonly clientService: ClientService) {}

  @Get('/')
  async healthz(): Promise<{
    success: boolean;
    timestamp: string;
  }> {
    this.logger.log('ping');

    const result = await this.clientService.default.query(
      'SELECT now FROM NOW()',
    );

    return {
      success: true,
      timestamp: result.rows[0]?.now,
    };
  }
}
