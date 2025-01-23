import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { ClientInterceptor } from '../../database/client.interceptor';
import { PGDumpService } from '../services/pg_dump.service';

@UseGuards(AdminGuard)
@UseInterceptors(ClientInterceptor)
@Controller('pg_dump')
export class PGDumpController {
  constructor(private readonly PGDumpService: PGDumpService) {}

  @Post('tables')
  async dump_tables(
    @Body()
    body: {
      conn: string;
      schema: string;
      tables: string[];
      withData?: boolean;
      dataOnly?: boolean;
    },
  ): Promise<any> {
    let sql_pg: string,
      sql_ts: string = '';

    // Using "pg_dump" to dump the tables
    // (this method is under deprecation in favor of "ts_dump")
    try {
      const res = await this.PGDumpService.dump(body);
      sql_pg = res.sql;
    } catch (e: any) {
      sql_pg = e.message;
    }

    // Using "ts_dump" to dump the tables
    // (this method is still experimental, but under optimistic)
    try {
      const res = await this.PGDumpService.dump_ts(body);

      sql_ts = res.sql;
    } catch (e: any) {
      sql_ts = e.message;
    }

    return {
      req: body,
      cmd: 'n/a',
      sql_pg,
      sql_ts,
      // stats: {
      //   connection: aquisitionTime,
      //   execution: executionTime,
      // },
    };
  }

  @Post('schema')
  async dump_schema(
    @Body()
    body: {
      conn: string;
      schema: string;
    },
  ): Promise<any> {
    const { cmd, sql, aquisitionTime, executionTime } =
      await this.PGDumpService.dump(body);

    return {
      req: body,
      cmd,
      sql,
      stats: {
        connection: aquisitionTime,
        execution: executionTime,
      },
    };
  }
}
