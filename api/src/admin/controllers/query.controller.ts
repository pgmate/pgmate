import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { performance } from 'perf_hooks';
import { ClientInterceptor } from '../../database/client.interceptor';
import { ClientService } from '../../database/client.service';
import { AdminGuard } from '../admin.guard';

const shouldAnalyze = (statement) => {
  if (statement.trim().toUpperCase().startsWith('CREATE')) return false;
  if (statement.trim().toUpperCase().startsWith('ALTER')) return false;
  return true;
};

@UseGuards(AdminGuard)
@UseInterceptors(ClientInterceptor)
@Controller('query')
export class QueryController {
  constructor(private readonly clientService: ClientService) {}

  private async _query(client, query, variables) {
    const timerStart = performance.now();
    const result = await client.query(query, variables);
    const timerEnd = performance.now();
    return [result, `${(timerEnd - timerStart).toFixed(3)} ms`];
  }

  @Post('')
  async query(
    @Body()
    body: {
      conn: string;
      database?: string;
      queries: {
        statement: string;
        variables?: any[];
      }[];
      disableAnalyze?: boolean;
    },
  ): Promise<{
    queries: {
      query: {
        statement: string;
        variables?: any[];
      };
      rows?: any[];
      error?: { message: string; error: any };
      plan?: string[];
      stats: {
        query: string;
        planning?: string;
        execution?: string;
      };
      meta: any;
    }[];
    stats: {
      connection: string;
    };
  }> {
    const client = this.clientService.target;
    const aquisitionTime = '0 ms';

    try {
      const queries = [];
      for (const query of body.queries) {
        try {
          // Run query:
          // console.log('@query:', query.statement)
          const [{ rows, ...meta }, queryTime] = await this._query(
            client,
            query.statement,
            query.variables,
          );

          // Analyze query:
          let explained: any,
            executionTimeRow: any,
            executionTime: string,
            planningTimeRow: any,
            planningTime: string;

          // TODO: skip analyze queries that will surely fail (create table, ...)
          if (!body.disableAnalyze && shouldAnalyze(query.statement)) {
            try {
              // console.log('@explain:', 'EXPLAIN ANALYZE ' + query.statement)
              explained = await this._query(
                client,
                'EXPLAIN ANALYZE ' + query.statement,
                query.variables,
              );
              // console.log('@analyzeDone')
              executionTimeRow = explained[0].rows.pop();
              executionTime = executionTimeRow['QUERY PLAN'].split(':').pop();
              planningTimeRow = explained[0].rows.pop();
              planningTime = planningTimeRow['QUERY PLAN'].split(':').pop();
            } catch (err) {
              console.log('Analyze failed for:', query.statement, err.message);
              explained = null;
            }
          }

          queries.push({
            query,
            rows,
            error: null,
            plan:
              explained &&
              [...explained[0].rows, planningTimeRow, executionTimeRow].map(
                (r) => r['QUERY PLAN'],
              ),
            stats: {
              query: queryTime,
              planning: planningTime,
              execution: executionTime,
            },
            meta,
          });
        } catch (error) {
          queries.push({
            query,
            rows: null,
            error: { message: error.message, error },
            plan: null,
            stats: {
              query: 0,
              planning: 0,
              execution: 0,
            },
            meta: null,
          });
        }
      }

      return {
        stats: {
          connection: aquisitionTime,
        },
        queries,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
