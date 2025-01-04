import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { PGDumpService } from '../services/pg_dump.service';

@UseGuards(AdminGuard)
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
    const { cmd, sql, aquisitionTime, executionTime } =
      await this.PGDumpService.dump(body);

    const ts = await this.PGDumpService.dump_ts(body);

    return {
      req: body,
      cmd,
      sql,
      sql_ts: ts.sql,
      stats: {
        connection: aquisitionTime,
        execution: executionTime,
      },
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
