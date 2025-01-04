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

  async dump_ts({
    conn,
    schema,
    tables,
  }: {
    conn: string;
    schema?: string;
    tables?: string[];
  }) {
    const [client, aquisitionTime, connectionString] =
      await this.connectionsService.createClient(conn);

    const _dll: string[] = [];

    for (const table of tables) {
      // 1. Create Table Statement (columns, types, options)
      const createTable = await client.query(
        `
    WITH cols AS (
      SELECT a.attname AS column_name,
             pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
             (SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid)
              FROM pg_catalog.pg_attrdef d
              WHERE d.adrelid = a.attrelid
                AND d.adnum = a.attnum
                AND a.atthasdef) AS default_value,
             a.attnotnull AS not_null
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = $1
        AND c.relname = $2
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum
    )
    SELECT 'CREATE TABLE ' || quote_ident($1) || '.' || quote_ident($2)
           || E' (\n'
           || string_agg(
                '  ' || quote_ident(column_name)
                || ' ' || data_type
                || CASE WHEN not_null THEN ' NOT NULL' ELSE '' END
                || COALESCE(' DEFAULT ' || default_value, '')
                , E',\n'
              )
           || E'\n);' AS ddl
    FROM cols;
  `,
        [schema, table],
      );

      // 2. Constraints (PK, CHECK, FK, etc.)
      const constraints = await client.query(
        `
        SELECT
        con.conname,
        con.contype,
        pg_get_constraintdef(con.oid, false) AS constraint_def,
        quote_ident(nsp.nspname) AS table_schema,
        quote_ident(rel.relname) AS table_name,
        quote_ident(refnsp.nspname) AS ref_schema,
        quote_ident(refrel.relname) AS ref_table
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class rel      ON rel.oid = con.conrelid
        JOIN pg_catalog.pg_namespace nsp  ON nsp.oid = rel.relnamespace
        LEFT JOIN pg_catalog.pg_class refrel   ON refrel.oid = con.confrelid
        LEFT JOIN pg_catalog.pg_namespace refnsp ON refnsp.oid = refrel.relnamespace
        WHERE nsp.nspname = $1
          AND rel.relname = $2
        ORDER BY con.contype;
      `,
        [schema, table],
      );

      // 3. Indexes
      //     const indexes = await client.query(
      //       `
      //   SELECT pg_catalog.pg_get_indexdef(idx.indexrelid, 0, true) AS index_def
      //   FROM pg_catalog.pg_class tbl
      //   JOIN pg_catalog.pg_namespace nsp ON nsp.oid = tbl.relnamespace
      //   JOIN pg_catalog.pg_index idx ON tbl.oid = idx.indrelid
      //   JOIN pg_catalog.pg_class idxcls ON idxcls.oid = idx.indexrelid
      //   WHERE nsp.nspname = $1
      //     AND tbl.relname = $2;
      // `,
      //       [schema, table],
      //     );

      // 4. Extended Statistics
      //     const stats = await client.query(
      //       `
      //   SELECT pg_catalog.pg_get_statisticsobjdef(s.oid) AS stats_def
      //   FROM pg_catalog.pg_statistic_ext s
      //   JOIN pg_catalog.pg_class tbl ON tbl.oid = s.stxrelid
      //   JOIN pg_catalog.pg_namespace nsp ON nsp.oid = tbl.relnamespace
      //   WHERE nsp.nspname = $1
      //     AND tbl.relname = $2;
      // `,
      //       [schema, table],
      //     );

      // 5. Comments
      //     const comments = await client.query(
      //       `
      //   SELECT obj_type, obj_name, pg_catalog.obj_description(obj_oid, obj_cat) AS comment
      //   FROM (
      //     SELECT 'TABLE' AS obj_type,
      //            c.oid AS obj_oid,
      //            'pg_class' AS obj_cat,
      //            $2 AS obj_name
      //     FROM pg_class c
      //     JOIN pg_namespace n ON c.relnamespace = n.oid
      //     WHERE n.nspname = $1
      //       AND c.relname = $2
      //     UNION
      //     SELECT 'COLUMN' AS obj_type,
      //            c.oid + att.attnum AS obj_oid,
      //            'pg_attribute' AS obj_cat,
      //            att.attname AS obj_name
      //     FROM pg_class c
      //     JOIN pg_namespace n ON c.relnamespace = n.oid
      //     JOIN pg_attribute att ON att.attrelid = c.oid
      //     WHERE n.nspname = $1
      //       AND c.relname = $2
      //       AND att.attnum > 0
      //       AND NOT att.attisdropped
      //   ) sub
      //   WHERE pg_catalog.obj_description(obj_oid, obj_cat) IS NOT NULL;
      // `,
      //       [schema, table],
      //     );

      // Merge everything
      let ddl = createTable.rows[0]?.ddl || '';
      constraints.rows.forEach((row: any) => {
        let def = row.constraint_def;

        // Quote column names in (...), e.g. (actor_id, film_id) -> ("actor_id", "film_id")
        def = def.replace(/\(([^()]+)\)/g, (_, cols) => {
          return (
            '(' +
            cols
              .split(',')
              .map((c) => `"${c.trim()}"`)
              .join(', ') +
            ')'
          );
        });

        // Fully qualify foreign key references
        if (row.contype === 'f') {
          // Example of raw: FOREIGN KEY ("actor_id") REFERENCES actor(actor_id)
          // We want: FOREIGN KEY ("actor_id") REFERENCES "public"."actor"("actor_id")
          def = def.replace(
            /REFERENCES\s+(\S+)\s*\(([^()]+)\)/,
            `REFERENCES "${row.ref_schema}"."${row.ref_table}"($2)`,
          );
        }

        ddl += `\nALTER TABLE ONLY "${schema}"."${table}" ADD CONSTRAINT "${row.conname}" ${def};`;
      });
      // indexes.rows.forEach((i) => (ddl += `\n${i.index_def};`));
      // stats.rows.forEach((s) => (ddl += `\n${s.stats_def};`));
      // comments.rows.forEach((comm) => {
      //   if (comm.obj_type === 'TABLE') {
      //     ddl += `\nCOMMENT ON TABLE "${schema}"."${table}" IS '${comm.comment.replace(/'/g, "''")}';`;
      //   } else {
      //     ddl += `\nCOMMENT ON COLUMN "${schema}"."${table}"."${comm.obj_name}" IS '${comm.comment.replace(/'/g, "''")}';`;
      //   }
      // });

      _dll.push(ddl);
    }

    return {
      sql: _dll.join('\n'),
    };
  }
}
