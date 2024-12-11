import { Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { ConnectionsService } from '../services/connections.service';
import { parsePGString } from '../../database/utils/parse-pgstring';
import { getMajorVersion } from '../../database/utils/get-version';

@Injectable()
export class PGDumpService {
  private readonly logger = new Logger(PGDumpService.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  async dump({
    conn,
    schema,
    tables,
    withData,
    dataOnly,
    full,
  }: {
    conn: string;
    schema?: string;
    tables?: string[];
    withData?: boolean;
    dataOnly?: boolean;
    full?: boolean;
  }) {
    const [client, aquisitionTime, connectionString] =
      await this.connectionsService.createClient(conn);

    try {
      const version = await getMajorVersion(client);

      const { host, port, user, password, database } =
        parsePGString(connectionString);

      // Build command
      const cmd = [
        `pg_dump-${version}`,
        `--host=${host}`,
        `--port=${port}`,
        `--username=${user}`,
        `--no-owner`,
        `--no-comments`,
        `--no-acl`,
        `--inserts`,
      ];

      if (!withData && !dataOnly) {
        cmd.push(`--schema-only`);
      }

      if (dataOnly) {
        cmd.push(`--data-only`);
      }

      // Target specific schema
      if (schema) {
        cmd.push(`--schema=${schema}`);
      }

      // Target specific tables
      if (schema && tables) {
        const _tables = Array.isArray(tables) ? tables : [tables];
        _tables.forEach((t) => cmd.push(`--table=${schema}.${t}`));
      }

      // Skip comments and ACLs
      if (!full) {
        cmd.push(`${database} | grep -vE '^(SET|SELECT pg_catalog|--)'`);
      }

      // Build environment variables
      const env = { ...process.env, PGPASSWORD: password };

      const timerStart = performance.now();
      const dump = await new Promise<string>((resolve, reject) => {
        exec(cmd.join(' '), { env }, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });
      });

      const cleanedDump = dump
        .trim()
        .split('\n')
        .reduce((acc, line) => {
          if (line.trim() === '' && acc[acc.length - 1] === '') {
            return acc; // Skip consecutive empty lines
          }
          return [...acc, line];
        }, [])
        .join('\n');
      const timerEnd = performance.now();

      return {
        cmd: cmd.join(' '),
        sql: cleanedDump,
        aquisitionTime,
        executionTime: `${(timerEnd - timerStart).toFixed(3)} ms`,
      };
    } finally {
      await client.end();
    }
  }
}
