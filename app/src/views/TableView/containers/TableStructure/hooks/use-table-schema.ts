import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDynamicQuery } from "hooks/use-query";

const GET_COLUMNS = `
SELECT
    c.column_name AS "name",
    c.data_type AS "type",
    c.column_default AS "default",
    (c.is_nullable = 'NO') AS "not_null",
    EXISTS (
        SELECT 1
        FROM pg_constraint pgc
        WHERE pgc.conrelid = (
            SELECT oid
            FROM pg_class
            WHERE relname = c.table_name
            AND relnamespace = (
                SELECT oid
                FROM pg_namespace
                WHERE nspname = c.table_schema
            )
        )
        AND pgc.contype = 'p' -- Primary Key
        AND pgc.conkey @> ARRAY[
            (
                SELECT ordinal_position::smallint
                FROM information_schema.columns
                WHERE table_schema = c.table_schema
                AND table_name = c.table_name
                AND column_name = c.column_name
            )
        ]
    ) AS "is_pkey"
FROM
    information_schema.columns c
WHERE
    c.table_schema = $1
    AND c.table_name = $2
ORDER BY
    c.ordinal_position;
`;

const GET_CONSTRAINTS = `
SELECT
    con.conname AS "name",
    CASE con.contype
        WHEN 'p' THEN 'Primary Key'
        WHEN 'u' THEN 'Unique'
        WHEN 'f' THEN 'Foreign Key'
        WHEN 'c' THEN 'Check'
        ELSE 'Other'
    END AS "type",
    array_agg(col.column_name ORDER BY ordinal_position) AS columns,
    pg_get_constraintdef(con.oid) AS definition
FROM
    pg_constraint con
JOIN
    pg_class tab ON con.conrelid = tab.oid
JOIN
    pg_namespace ns ON tab.relnamespace = ns.oid
LEFT JOIN
    information_schema.columns col
    ON col.table_schema = ns.nspname
    AND col.table_name = tab.relname
    AND ordinal_position = ANY (con.conkey)
WHERE
    ns.nspname = $1 -- Schema name
    AND tab.relname = $2 -- Table name
GROUP BY
    con.conname, con.contype, con.oid
ORDER BY "name";
    `;

const GET_INDEXES = `
SELECT
    i.relname AS "name",
    a.attname AS "column",
    idx.indisunique AS is_unique,
    idx.indisprimary AS is_primary,
    pg_get_indexdef(idx.indexrelid) AS definition
FROM
    pg_index idx
JOIN
    pg_class i ON i.oid = idx.indexrelid
JOIN
    pg_class t ON t.oid = idx.indrelid
JOIN
    pg_namespace n ON t.relnamespace = n.oid
LEFT JOIN
    pg_attribute a ON a.attnum = ANY(idx.indkey) AND a.attrelid = t.oid
WHERE
    n.nspname = $1 -- Schema name
    AND t.relname = $2 -- Table name
ORDER BY
    "name", "column";
`;

export interface Column {
  name: string;
  type: string;
  default: string | null;
  not_null: boolean;
  is_pkey: boolean;
}

export interface Constraint {
  name: string;
  type: string;
  columns: string[];
  definition: string;
}

export interface Index {
  name: string;
  column: string;
  is_unique: boolean;
  is_primary: boolean;
  definition: string;
}

export const useTableSchema = () => {
  const { conn, schema, table } = useParams<{
    conn: string;
    schema: string;
    table: string;
  }>();

  const query = useDynamicQuery(conn!);

  const [columns, setColumns] = useState<Column[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [indexes, setIndexes] = useState<Index[]>([]);

  useEffect(() => {
    const run = async () => {
      const [columns] = await query(GET_COLUMNS, [schema, table]);
      setColumns(columns as Column[]);

      const [constraints] = await query(GET_CONSTRAINTS, [schema, table]);
      setConstraints(constraints as Constraint[]);

      const [indexes] = await query(GET_INDEXES, [schema, table]);
      setIndexes(indexes as Index[]);
    };
    run();
  }, [conn, schema, table]);

  return {
    columns,
    constraints,
    indexes,
  };
};
