import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { ConnectionsService } from '../services/connections.service';

@Injectable()
export class PGSchemaService {
  private readonly logger = new Logger(PGSchemaService.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  async getSchema(client: Client): Promise<void> {
    console.log(client);
  }
}
