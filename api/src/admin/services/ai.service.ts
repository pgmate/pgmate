import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { ClientService } from '../../database/client.service';

type LLMRole = 'system' | 'user' | 'assistant';
type LLMModel = 'gpt-4o' | 'gpt-4o-mini';

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMOptions {
  model?: LLMModel;
  temperature?: number;
  limit?: number; // Max number of return tokens
  format?: 'json_object' | 'text'; // Response format
}

export interface LLMResponse {
  _cacheId?: string;
  choices: {
    index: number;
    message: {
      role: LLMRole;
      content: string;
    };
  }[];
  usage: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

const DEFAULT_LLM_OPTIONS: LLMOptions = {
  model: 'gpt-4o-mini',
  temperature: 0,
  limit: 1000,
  format: 'text',
};

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly clientService: ClientService,
  ) {}

  /**
   * Sends a completion request to the OpenAI API
   * the request is cached to avoid repeated calls
   * @param messages
   * @param _options
   * @returns
   */
  async complete(
    messages: LLMMessage[],
    _options: LLMOptions = {},
  ): Promise<LLMResponse> {
    const options = { ...DEFAULT_LLM_OPTIONS, ..._options };

    const apiKey = this.configService.get<string>('PGMATE_OPENAPI_KEY');
    const apiUrl = this.configService.get<string>('PGMATE_OPENAPI_URL');
    const request = {
      model: options.model,
      messages,
      temperature: options.temperature,
      max_completion_tokens: options.limit,
      response_format: {
        type: options.format,
      },
    };

    const cacheKey = crypto
      .createHash('sha256')
      .update(JSON.stringify({ options, request }))
      .digest('hex');

    // Cache lookup:
    const cache = await this.clientService.default.query(
      `SELECT response FROM pgmate.llm_cache WHERE hash = $1 LIMIT 1`,
      [cacheKey],
    );
    if (cache.rowCount) {
      // await new Promise((resolve) => setTimeout(resolve, 4000));
      return {
        _cacheId: cacheKey,
        ...cache.rows[0].response,
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, request, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      await this.clientService.default.query(
        `INSERT INTO pgmate.llm_cache (hash, options, request, response) VALUES ($1, $2, $3, $4)`,
        [cacheKey, options, request, response.data],
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error calling OpenAI API',
        error?.response?.data || error,
      );

      if (error?.response) {
        throw new Error(error?.response.data.error.message);
      }

      throw new Error('Failed to complete request to OpenAI API');
    }
  }
}
