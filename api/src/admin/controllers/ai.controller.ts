import {
  Post,
  Body,
  Controller,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ClientInterceptor } from '../../database/client.interceptor';
import { ClientService } from '../../database/client.service';
import { PGSchemaService } from '../services/pg_schema.service';
import { AIService } from '../services/ai.service';
import { AIFull } from './pg_schema.ai-full';
import { AICompact } from './pg_schema.ai-compact';
import type {
  LLMMessage,
  LLMOptions,
  LLMResponse,
} from '../services/ai.service';

@UseGuards(AdminGuard)
@UseInterceptors(ClientInterceptor)
@Controller('ai')
export class AIController {
  constructor(
    private readonly clientService: ClientService,
    private readonly PGSchemaService: PGSchemaService,
    private readonly AIService: AIService,
  ) {}

  @Post('complete')
  async complete(
    @Body() body: { messages: LLMMessage[]; options: LLMOptions },
  ): Promise<LLMResponse> {
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

  @Post('ask')
  async ask(
    @Body()
    body: {
      conn: string;
      database?: string;
      messages: LLMMessage[];
      options: LLMOptions & {
        context: 'full' | 'compact';
      };
    },
  ): Promise<LLMResponse> {
    // Retrive DB Info
    let dbInfo: {
      schema: any;
      aiFull: any;
      aiCompact: any;
    };

    await (async () => {
      try {
        const client = this.clientService.target;
        const schema = await this.PGSchemaService.getSchema(client);
        const aiFull = AIFull(schema);
        const aiCompact = AICompact(aiFull);

        dbInfo = {
          schema,
          aiFull,
          aiCompact,
        };
      } catch (e: any) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
    })();

    // Prepare the conversation history
    const { context = 'compact', ...options } = body.options;
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `
You are an expert Postgres SQL engineer.
You have access to a DATABASE with the following SCHEMA:
${JSON.stringify(context === 'full' ? dbInfo.aiFull : dbInfo.aiCompact)}

You are given an optional CONVERSATION HISTORY that you can use to better understand the context of the request.
The USER REQUEST is given as the last message in the CONVERSATION HISTORY.

Your taks is to answer the USER REQUEST providing one of the following properties in a JSON document:

- "query": The SQL query that answers the USER REQUEST
- "answer": The answer to the USER REQUEST formatted as Markdown
- "question": Ask the user for more information to clarify the request

IMPORTANT: The full output should be a parsable JSON document and you have a hard limit at ${options.limit} tokens.
        `.trim(),
      },
      // TODO: trim old messages that may kick the conversation out of the window context size
      ...body.messages,
    ];

    try {
      return this.AIService.complete(messages, {
        ...options,
        format: 'json_object',
      });
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
