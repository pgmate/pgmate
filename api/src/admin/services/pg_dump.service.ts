import { Injectable, Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { ClientService } from '../../database/client.service';
import { parsePGString } from '../../database/utils/parse-pgstring';
import { getMajorVersion } from '../../database/utils/get-version';

@Injectable()
export class PGDumpService {
  private readonly logger = new Logger(PGDumpService.name);
  constructor(private readonly clientService: ClientService) {}

  async dump({
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
    const client = this.clientService.target;
    const aquisitionTime = '0ms';
    const connectionString =
      this.clientService.dangerouslyExposeTargetConnectionString;

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
    // const [client, aquisitionTime, connectionString] =
    //   await this.connectionsService.createClient(conn);

    const client = this.clientService.target;

    const _dll: string[] = [];

    try {
      for (const table of tables) {
        let ddl = '';

        // 1. export series
        ddl += `-- Series for: ${schema}.${table}\n`;
        const seqReferences = await client.query(
          `
        SELECT
          quote_ident(n.nspname) AS schema_name,
          quote_ident(c.relname) AS table_name,
          quote_ident(a.attname) AS column_name,
          pg_get_expr(ad.adbin, ad.adrelid) AS default_expr
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
        WHERE n.nspname = $1
          AND c.relname = $2
          AND pg_get_expr(ad.adbin, ad.adrelid) LIKE '%nextval(%'
          AND NOT a.attisdropped
          AND a.attnum > 0;
        `,
          [schema, table],
        );

        const sequencesFound: { seqSchema: string; seqName: string }[] = [];

        seqReferences.rows.forEach((row) => {
          const match = /nextval\('([^']+)'::regclass\)/.exec(row.default_expr);
          if (match) {
            const seqFull = match[1]; // e.g. "public.actor_actor_id_seq" or just "actor_actor_id_seq"
            if (seqFull.includes('.')) {
              const [seqSchema, seqName] = seqFull.split('.');
              sequencesFound.push({ seqSchema, seqName });
            } else {
              // If no schema is given, use the table's schema (row.schema_name)
              sequencesFound.push({
                seqSchema: row.schema_name.replace(/"/g, ''),
                seqName: seqFull,
              });
            }
          }
        });

        let sequencesDDL = '';

        for (const { seqSchema, seqName } of sequencesFound) {
          // Query the sequence metadata
          const seqData = await client.query(
            `
    SELECT
      s.seqstart,
      s.seqincrement,
      s.seqmax,
      s.seqmin,
      s.seqcache,
      s.seqcycle
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_sequence s ON s.seqrelid = c.oid
    WHERE n.nspname = $1
      AND c.relname = $2
      AND c.relkind = 'S';
    `,
            [seqSchema, seqName],
          );

          if (!seqData.rows.length) continue; // No sequence found or not valid

          const { seqstart, seqincrement, seqmax, seqmin, seqcache, seqcycle } =
            seqData.rows[0];

          // Build CREATE SEQUENCE statement
          // Note: Always quote schema & sequence name
          sequencesDDL += `CREATE SEQUENCE "${seqSchema}"."${seqName}"
START WITH ${seqstart}
INCREMENT BY ${seqincrement}
MINVALUE ${seqmin}
MAXVALUE ${seqmax}
CACHE ${seqcache} ${seqcycle ? 'CYCLE' : 'NO CYCLE'};\n`;
        }

        ddl += sequencesDDL + '\n';

        // 2. export table / view / materialized view DDL
        // Detect object type and generate DDL accordingly
        ddl += `-- DDL for: ${schema}.${table}\n`;

        const objectTypeQuery = await client.query(
          `
  SELECT
    relkind
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = $1 AND c.relname = $2;
  `,
          [schema, table],
        );

        const objectType = objectTypeQuery.rows[0]?.relkind;

        if (objectType === 'r') {
          // Regular table
          const createTable = await client.query(
            `
    WITH cols AS (
      SELECT
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        (
          SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid)
          FROM pg_catalog.pg_attrdef d
          WHERE d.adrelid = a.attrelid
            AND d.adnum = a.attnum
            AND a.atthasdef
        ) AS default_value,
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
    SELECT
      'CREATE TABLE "' || quote_ident($1) || '"."' || quote_ident($2) || '" (' ||
      E'\n' ||
      string_agg(
        '  "' || column_name || '" ' ||
        data_type ||
        CASE WHEN not_null THEN ' NOT NULL' ELSE '' END ||
        COALESCE(' DEFAULT ' || default_value, ''),
        E',\n'
      ) ||
      E'\n);' AS ddl
    FROM cols;
    `,
            [schema, table],
          );

          ddl += createTable.rows[0]?.ddl || '';
        } else if (objectType === 'v') {
          // View
          const createView = await client.query(
            `
    SELECT
      'CREATE VIEW "' || quote_ident($1) || '"."' || quote_ident($2) || '" AS ' || 
      pg_catalog.pg_get_viewdef(c.oid, true) AS ddl
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = $1 AND c.relname = $2;
    `,
            [schema, table],
          );

          ddl += createView.rows[0]?.ddl || '';
        } else if (objectType === 'm') {
          // Materialized view
          const createMaterializedView = await client.query(
            `
    SELECT
      'CREATE MATERIALIZED VIEW "' || quote_ident($1) || '"."' || quote_ident($2) || '" AS ' || 
      pg_catalog.pg_get_viewdef(c.oid, true) AS ddl
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = $1 AND c.relname = $2;
    `,
            [schema, table],
          );

          ddl += createMaterializedView.rows[0]?.ddl || '';
        } else {
          ddl += `-- Unsupported object type: ${objectType}\n`;
        }

        ddl += '\n\n';

        // 3. Constraints (PK, CHECK, FK, etc.)
        ddl += `-- Constraints for: ${schema}.${table}\n`;
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

          ddl += `ALTER TABLE ONLY "${schema}"."${table}"\nADD CONSTRAINT "${row.conname}" ${def};\n`;
        });

        ddl += '\n';

        // 4. Indexes
        ddl += `-- Indexes for: ${schema}.${table}\n`;
        const indexes = await client.query(
          `
        SELECT
      idxcls.relname AS index_name,
      pg_catalog.pg_get_indexdef(idx.indexrelid, 0, true) AS index_def,
      nsp.nspname AS schema_name,
      tbl.relname AS table_name
    FROM pg_catalog.pg_class tbl
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = tbl.relnamespace
    JOIN pg_catalog.pg_index idx ON tbl.oid = idx.indrelid
    JOIN pg_catalog.pg_class idxcls ON idxcls.oid = idx.indexrelid
    LEFT JOIN pg_catalog.pg_constraint con ON con.conindid = idx.indexrelid
    WHERE nsp.nspname = $1
      AND tbl.relname = $2
      AND con.conindid IS NULL;
      `,
          [schema, table],
        );

        indexes.rows.forEach((row) => {
          // Fix schema/table quoting in the CREATE INDEX statement
          let finalDef = row.index_def.replace(
            /^(CREATE\s+INDEX\s+)(\S+)(\s+ON\s+)(\S+)/i,
            `$1"${row.index_name}"$3"${row.schema_name}"."${row.table_name}"`,
          );

          // Quote column names inside (...)
          finalDef = finalDef.replace(/\(([^()]+)\)/g, (_, cols) => {
            return (
              '(' +
              cols
                .split(',')
                .map((c) => `"${c.trim().replace(/"/g, '')}"`)
                .join(', ') +
              ')'
            );
          });

          if (!finalDef.endsWith(';')) {
            finalDef += ';';
          }

          ddl += `${finalDef}\n`;
        });

        ddl += '\n';

        // 5. Triggers
        ddl += `-- Triggers for: ${schema}.${table}\n`;
        const triggers = await client.query(
          `
    SELECT
      t.tgname AS trigger_name,
      pg_catalog.pg_get_triggerdef(t.oid, false) AS trigger_def,
      quote_ident(n.nspname) AS schema_name,
      quote_ident(c.relname) AS table_name
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = $1
      AND c.relname = $2
      AND NOT t.tgisinternal
    ORDER BY t.tgname;
  `,
          [schema, table],
        );

        triggers.rows.forEach((row) => {
          let def = row.trigger_def;

          // Ensure trigger name is quoted
          def = def.replace(
            new RegExp(`^CREATE\\s+TRIGGER\\s+${row.trigger_name}`, 'i'),
            `CREATE TRIGGER "${row.trigger_name}"`,
          );

          // Force quoting for the "ON schema.table"
          // (handles cases like ON public.film_actor or ON "public"."film_actor")
          def = def.replace(
            new RegExp(
              ` ON\\s+(?:"?${row.schema_name}"?\\.)?"?${row.table_name}"? `,
              'i',
            ),
            `ON "${row.schema_name}"."${row.table_name}"\n`,
          );

          // Force quoting for the function call:
          //  EXECUTE FUNCTION "public"."some_func"(...)
          // Matches optional quotes around (schema.)functionName
          def = def.replace(
            /EXECUTE\s+FUNCTION\s+(?:"?([^".]+)"?\.)?"?([^"(\s]+)"?\(/i,
            `EXECUTE FUNCTION "${row.schema_name}"."$2"(`,
          );

          ddl += `${def};\n`;
        });

        ddl += '\n';

        // 6. Extended Statistics
        ddl += `-- Extended Statistics for: ${schema}.${table}\n`;
        const stats = await client.query(
          `
        SELECT
          s.oid,
          s.stxname,
          s.stxkind,  -- array of chars like {n,d,m}
          pg_catalog.pg_get_statisticsobjdef(s.oid) AS stats_def
        FROM pg_catalog.pg_statistic_ext s
        JOIN pg_catalog.pg_class tbl ON tbl.oid = s.stxrelid
        JOIN pg_catalog.pg_namespace nsp ON nsp.oid = tbl.relnamespace
        WHERE nsp.nspname = $1
          AND tbl.relname = $2;
  `,
          [schema, table],
        );

        // This might be version-specific, so we need to map the stxkind chars to their full names
        // it needs WAY more work...
        const kindMap: Record<string, string> = {
          n: 'ndistinct', // Extended statistics for distinct counts
          d: 'dependencies', // Extended statistics for column dependencies
          m: 'mcv', // Most Common Values
          f: 'ndistinct', // Functional dependencies || ndistinct ?!?
          e: 'expressions', // Expression statistics
        };

        stats.rows.forEach((row: any) => {
          // Before using 'def', define it from row.stats_def:
          let def = row.stats_def;

          // Parse stxkind into an array of chars
          let rawKinds: string[];
          if (typeof row.stxkind === 'string') {
            // stxkind might look like '{n,d,m}', so remove braces and split by comma
            rawKinds = row.stxkind.replace(/[{}]/g, '').split(',');
          } else {
            // If it's already an array, just use it directly
            rawKinds = row.stxkind;
          }

          // Build the list of statistic kinds (e.g. ndistinct, dependencies, mcv)
          const statsKinds = rawKinds.map((k) => kindMap[k] || k).join(', ');

          // 1. Extract & fix the CREATE STATISTICS line
          //    Dynamically insert (kind1, kind2, ...) and quote schema + stats name
          const createRegex = /^(CREATE\s+STATISTICS\s+)([^\s]+)/i;
          const createMatch = createRegex.exec(def);
          if (!createMatch) {
            // If there's no match, skip this row
            return;
          }

          const prefix = createMatch[1]; // e.g. "CREATE STATISTICS "
          const rawStatsName = createMatch[2]; // e.g. "public.film_actor_stats"

          // Quote the schema and statistic name
          let fixedStatsName: string;
          if (rawStatsName.includes('.')) {
            // Already has a schema part like public.film_actor_stats
            const [statsSchema, statsObjName] = rawStatsName.split('.');
            fixedStatsName = `"${statsSchema}"."${statsObjName}"`;
          } else {
            // No explicit schema, use the given 'schema'
            fixedStatsName = `"${schema}"."${rawStatsName}"`;
          }

          // Replace the CREATE STATISTICS line with quoted names + dynamic kinds
          def = def.replace(
            createRegex,
            `${prefix}${fixedStatsName} (${statsKinds})`,
          );

          // 2. Quote columns in ON (...)
          //    e.g. ON (actor_id, film_id) => ON ("actor_id", "film_id")
          def = def.replace(/ON\s*\(([^)]+)\)/i, (_, cols) => {
            const quotedCols = cols
              .split(',')
              .map((col) => `"${col.trim().replace(/"/g, '')}"`)
              .join(', ');
            return `ON (${quotedCols})`;
          });

          // 3. Quote the table in FROM ...
          //    Might be FROM film_actor or FROM public.film_actor => FROM "public"."film_actor"
          const fromRegex = /\bFROM\s+([^\s]+)/i;
          def = def.replace(fromRegex, (_, tableName) => {
            if (tableName.includes('.')) {
              const [tblSchema, tbl] = tableName.split('.');
              return `FROM "${tblSchema}"."${tbl}"`;
            }
            return `FROM "${schema}"."${tableName}"`;
          });

          // Finally, add the statement to your DDL buffer
          ddl += `${def};\n`;
        });

        ddl += '\n';

        // 7. Comments
        ddl += `-- Comments for: ${schema}.${table}\n`;
        const comments = await client.query(
          `
        SELECT
  pg_description.description AS comment,
  nsp.nspname AS schema_name,
  cls.relname AS object_name,
  CASE
    WHEN cls.relkind = 'r' THEN 'TABLE'
    WHEN cls.relkind = 'i' THEN 'INDEX'
    WHEN cls.relkind = 'S' THEN 'SEQUENCE'
    WHEN cls.relkind = 'v' THEN 'VIEW'
    WHEN cls.relkind = 'm' THEN 'MATERIALIZED VIEW'
    ELSE 'OTHER'
  END AS object_type
FROM pg_description
JOIN pg_class cls ON pg_description.objoid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = $1
  AND cls.relname = $2

UNION ALL

SELECT
  col_description(a.attrelid, a.attnum) AS comment,
  nsp.nspname AS schema_name,
  a.attname AS object_name,
  'COLUMN' AS object_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace nsp ON c.relnamespace = nsp.oid
WHERE nsp.nspname = $1
  AND c.relname = $2
  AND a.attnum > 0
  AND NOT a.attisdropped

UNION ALL

SELECT
  pg_description.description AS comment,
  nsp.nspname AS schema_name,
  t.tgname AS object_name,
  'TRIGGER' AS object_type
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace nsp ON c.relnamespace = nsp.oid
LEFT JOIN pg_description ON t.oid = pg_description.objoid
WHERE nsp.nspname = $1
  AND c.relname = $2
  AND NOT t.tgisinternal

UNION ALL

SELECT
  pg_description.description AS comment,
  nsp.nspname AS schema_name,
  s.stxname AS object_name,
  'STATISTICS' AS object_type
FROM pg_statistic_ext s
JOIN pg_class c ON s.stxrelid = c.oid
JOIN pg_namespace nsp ON c.relnamespace = nsp.oid
LEFT JOIN pg_description ON s.oid = pg_description.objoid
WHERE nsp.nspname = $1
  AND c.relname = $2

UNION ALL

SELECT
  pg_description.description AS comment,
  nsp.nspname AS schema_name,
  con.conname AS object_name,
  'CONSTRAINT' AS object_type
FROM pg_constraint con
JOIN pg_class c ON con.conrelid = c.oid
JOIN pg_namespace nsp ON c.relnamespace = nsp.oid
LEFT JOIN pg_description ON con.oid = pg_description.objoid
WHERE nsp.nspname = $1
  AND c.relname = $2;
        `,
          [schema, table],
        );

        comments.rows.forEach((row: any) => {
          if (!row.comment) return;

          const commentText = row.comment.replace(/'/g, "''"); // Escape single quotes

          switch (row.object_type) {
            case 'TABLE':
              ddl += `COMMENT ON TABLE "${row.schema_name}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            case 'COLUMN':
              ddl += `COMMENT ON COLUMN "${row.schema_name}"."${table}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            case 'TRIGGER':
              ddl += `COMMENT ON TRIGGER "${row.object_name}" ON "${row.schema_name}"."${table}" IS '${commentText}';\n`;
              break;

            case 'STATISTICS':
              ddl += `COMMENT ON STATISTICS "${row.schema_name}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            case 'CONSTRAINT':
              ddl += `COMMENT ON CONSTRAINT "${row.object_name}" ON "${row.schema_name}"."${table}" IS '${commentText}';\n`;
              break;

            case 'INDEX':
              ddl += `COMMENT ON INDEX "${row.schema_name}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            case 'SEQUENCE':
              ddl += `COMMENT ON SEQUENCE "${row.schema_name}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            case 'VIEW':
            case 'MATERIALIZED VIEW':
              ddl += `COMMENT ON ${row.object_type} "${row.schema_name}"."${row.object_name}" IS '${commentText}';\n`;
              break;

            default:
              // Handle other or unknown object types if necessary
              ddl += `-- Unknown object type: ${row.object_type} for "${row.schema_name}"."${row.object_name}"\n`;
          }
        });

        ddl += '\n';

        _dll.push(ddl);
      }
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message);
    } finally {
      await client.end();
    }

    return {
      sql: _dll.join('\n'),
    };
  }
}
