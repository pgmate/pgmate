import { Body, Controller, Post, UseGuards, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { performance } from 'perf_hooks';
import { AdminGuard } from '../admin.guard';
import { ConnectionsService } from '../services/connections.service';

@UseGuards(AdminGuard)
@Controller('query')
export class QueryController {
  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private readonly connectionsService: ConnectionsService,
  ) {}

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
      rows: any[];
      plan?: string[];
      stats: {
        query: string;
        planning?: string;
        execution?: string;
      };
      // meta: any;
    }[];
    stats: {
      connection: string;
    };
  }> {
    const [client, aquisitionTime] = await this.connectionsService.createClient(
      body.conn,
    );

    try {
      const queries = [];
      for (const query of body.queries) {
        // Run query:
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
        if (!body.disableAnalyze) {
          explained = await this._query(
            client,
            'EXPLAIN ANALYZE ' + query.statement,
            query.variables,
          );
          executionTimeRow = explained[0].rows.pop();
          executionTime = executionTimeRow['QUERY PLAN'].split(':').pop();
          planningTimeRow = explained[0].rows.pop();
          planningTime = planningTimeRow['QUERY PLAN'].split(':').pop();
        }

        queries.push({
          query,
          rows,
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
          // meta,
        });
      }

      return {
        queries,
        stats: {
          connection: aquisitionTime,
        },
      };
    } finally {
      await client.end(); // Ensure the client is properly closed
    }
  }
}
