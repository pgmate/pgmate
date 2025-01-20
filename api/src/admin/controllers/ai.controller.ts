import {
  Post,
  Body,
  Controller,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ConnectionsService } from '../services/connections.service';
import { PGSchemaService } from '../services/pg_schema.service';
import { AIService } from '../services/ai.service';
import { AIFull } from './pg_schema.ai-full';
import { AICompact } from './pg_schema.ai-compact';
import type { LLMMessage, LLMOptions } from '../services/ai.service';

@UseGuards(AdminGuard)
@Controller('ai')
export class AIController {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly PGSchemaService: PGSchemaService,
    private readonly AIService: AIService,
  ) {}

  @Post('complete')
  async complete(
    @Body() body: { messages: LLMMessage[]; options: LLMOptions },
  ): Promise<any> {
    try {
      const res = await this.AIService.complete(
        body.messages,
        body.options || {},
      );

      return res;
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  // @Post('complete')
  // async complete(@Body() body: { messages: Message[] }): Promise<any> {
  //   const [client, aquisitionTime] = await this.connectionsService.createClient(
  //     body.conn,
  //     body.database,
  //   );

  //   // Retrive DB Info
  //   let dbInfo = {};
  //   try {
  //     const schema = await this.PGSchemaService.getSchema(client);
  //     const aiFull = AIFull(schema);
  //     const aiCompact = AICompact(aiFull);

  //     dbInfo = {
  //       schema,
  //       aiFull,
  //       aiCompact,
  //     };
  //   } catch (e: any) {
  //     console.error(e.message);
  //     throw new Error('Could not retreive schema');
  //   } finally {
  //     await client.end();
  //   }

  //   // Use o4-mini with compact schema to get the list of relevant tables
  //   let relevantTables = {};
  //   try {
  //     relevantTables = await this.AIService.complete([
  //       { role: 'user', message: body.query },
  //     ]);
  //     console.log(relevantTables);
  //   } catch (e: any) {
  //     console.error(e.message);
  //     throw new Error('Could not run AI');
  //   }

  //   // Get full schema for the relevant tables

  //   // Use o4 with full schema on relevant tables to generate the query

  //   return {
  //     query: body.query,
  //     relevantTables,
  //   };
  // }
}
