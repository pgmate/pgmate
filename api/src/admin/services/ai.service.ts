import {
  Injectable,
  Inject,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class AIService {
  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  async prompt(query: string): Promise<any> {
    return this.configService.get('PGMATE_OPENAPI_KEY');
  }
}
