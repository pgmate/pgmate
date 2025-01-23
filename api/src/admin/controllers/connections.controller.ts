import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ClientInterceptor } from '../../database/client.interceptor';
import { ConnectionsService } from '../services/connections.service';

@UseGuards(AdminGuard)
@UseInterceptors(ClientInterceptor)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

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
