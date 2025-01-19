import { Post, Body, Controller, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ConnectionsService } from '../services/connections.service';
import { PGSchemaService } from '../services/pg_schema.service';
import { AIFull } from './pg_schema.ai-full';
import { AICompact } from './pg_schema.ai-compact';

@UseGuards(AdminGuard)
@Controller('pg_schema')
export class PGSchemaController {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly PGSchemaService: PGSchemaService,
  ) {}

  @Post('')
  async getSchema(
    @Body() body: { conn: string; database?: string },
  ): Promise<any> {
    const [client, aquisitionTime] = await this.connectionsService.createClient(
      body.conn,
      body.database,
    );

    try {
      const timerStart = performance.now();
      const schema = await this.PGSchemaService.getSchema(client);
      const timerEnd = performance.now();

      console.log(schema);
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
    } finally {
      await client.end();
    }

    return {
      schema: {},
      aquisitionTime,
    };
  }
}
