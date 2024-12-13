import { Body, Controller, Post, UseGuards, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { performance } from 'perf_hooks';
import { AdminGuard } from '../admin.guard';
import { ConnectionsService } from '../services/connections.service';


const shouldAnalyze = statement => {
  if (statement.trim().toUpperCase().startsWith('CREATE')) return false;
  if (statement.trim().toUpperCase().startsWith('ALTER')) return false;
  return true;
}


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
      rows?: any[];
      error?: {message: string, error: any};
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
    const [client, aquisitionTime] = await this.connectionsService.createClient(
      body.conn,
    );

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
            console.log('Analyze failed for:', query.statement, err.message)
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
          error: { message: error.message, error},
          plan: null,
          stats: {
            query: 0,
            planning: 0,
            execution: 0
          },
          meta: null
        })
      }
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
