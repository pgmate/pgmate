import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Inject,
  Param,
} from '@nestjs/common';
import { Pool } from 'pg';
import { AdminGuard } from '../admin.guard';
import { EncryptionService } from '../../shared/services/encryption.service';
import { ConnectionsService } from '../services/connections.service';

@UseGuards(AdminGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private readonly encryptionService: EncryptionService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  @Get('')
  async getList() {
    const connections = await this.connectionsService.listConnections();

    return {
      connections,
    };
  }

  @Get(':name')
  async getItem(@Param('name') name: string) {
    const connection = await this.connectionsService.getConnection(name);
    return {
      connection,
    };
  }

  @Post('')
  async createConnection(
    @Body() body: { name: string; desc?: string; conn: string; ssl: boolean },
  ): Promise<{
    success: boolean;
    name?: string;
    error?: string;
  }> {
    try {
      await this.connectionsService.upsertConnection(
        body.name,
        body.conn,
        body.ssl,
        body.desc,
      );
      return { success: true, name: body.name };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
