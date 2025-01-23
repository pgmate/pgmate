import { Post, Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ClientInterceptor } from '../../database/client.interceptor';
import { ClientService } from '../../database/client.service';
import { PGSchemaService } from '../services/pg_schema.service';
import { AIFull } from './pg_schema.ai-full';
import { AICompact } from './pg_schema.ai-compact';

@UseGuards(AdminGuard)
@UseInterceptors(ClientInterceptor)
@Controller('pg_schema')
export class PGSchemaController {
  constructor(
    private readonly clientService: ClientService,
    private readonly PGSchemaService: PGSchemaService,
  ) {}

  @Post('')
  async getSchema(): Promise<any> {
    const client = this.clientService.target;
    const aquisitionTime = '0ms';

    try {
      const timerStart = performance.now();
      const schema = await this.PGSchemaService.getSchema(client);
      const timerEnd = performance.now();

      // console.log(schema);
      const aiFull = AIFull(schema);
      const aiCompact = AICompact(aiFull);

      return {
        schema,
        ai: {
          full: aiFull,
          compact: aiCompact,
        },
        aquisitionTime,
        queryTime: `${(timerEnd - timerStart).toFixed(3)} ms`,
      };
    } catch (e: any) {
      console.error(e);
    }

    return {
      schema: {},
      aquisitionTime,
    };
  }
}
