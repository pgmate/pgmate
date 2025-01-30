import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useURLConnection } from "hooks/use-connections";
import { useDynamicQuery } from "hooks/use-query";

const GET_UPSTREAM = `
WITH dependencies AS (
  -- Dependencies where the given table defines a foreign key (source)
  SELECT
    'foreign_key' AS dependency_type,
    pk_table_ns.nspname AS schema,
    pk_table.relname AS name,
    jsonb_build_object(
      'type', 'foreign_key',
      'fk_name', con.conname,
      'source', fk_table_ns.nspname || '.' || fk_table.relname,
      'source_columns', string_agg(att.attname, ', '),
      'target', pk_table_ns.nspname || '.' || pk_table.relname,
      'target_columns', string_agg(att2.attname, ', ')
    ) AS details
  FROM pg_constraint con
  JOIN pg_class fk_table ON con.conrelid = fk_table.oid
  JOIN pg_namespace fk_table_ns ON fk_table.relnamespace = fk_table_ns.oid
  JOIN pg_class pk_table ON con.confrelid = pk_table.oid
  JOIN pg_namespace pk_table_ns ON pk_table.relnamespace = pk_table_ns.oid
  JOIN pg_attribute att ON att.attnum = ANY (con.conkey) AND att.attrelid = fk_table.oid
  JOIN pg_attribute att2 ON att2.attnum = ANY (con.confkey) AND att2.attrelid = pk_table.oid
  WHERE con.contype = 'f'
    AND fk_table_ns.nspname = $1
    AND fk_table.relname = $2
  GROUP BY con.conname, fk_table_ns.nspname, fk_table.relname, pk_table_ns.nspname, pk_table.relname

  UNION ALL

  -- Dependencies on sequences (e.g., for auto-generated values)
  SELECT
    'sequence' AS dependency_type,
    seq_namespace.nspname AS schema,
    seq_class.relname AS name,
    jsonb_build_object(
      'type', 'sequence',
      'sequence_name', seq_namespace.nspname || '.' || seq_class.relname,
      'source_table', obj_namespace.nspname || '.' || obj_class.relname,
      'column_name', attr.attname
    ) AS details
  FROM pg_depend dep
  JOIN pg_class seq_class ON dep.objid = seq_class.oid
  JOIN pg_namespace seq_namespace ON seq_class.relnamespace = seq_namespace.oid
  JOIN pg_class obj_class ON dep.refobjid = obj_class.oid
  JOIN pg_namespace obj_namespace ON obj_class.relnamespace = obj_namespace.oid
  JOIN pg_attribute attr ON dep.refobjsubid = attr.attnum AND attr.attrelid = obj_class.oid
  WHERE obj_namespace.nspname = $3
    AND obj_class.relname = $4
    AND seq_class.relkind = 'S' -- Sequences

  UNION ALL

  -- Dependencies on functions used in default values or constraints
  SELECT
    'function' AS dependency_type,
    func_namespace.nspname AS schema,
    proc.proname AS name,
    jsonb_build_object(
      'type', 'function',
      'function_name', func_namespace.nspname || '.' || proc.proname,
      'source_table', obj_namespace.nspname || '.' || obj_class.relname,
      'column_name', attr.attname
    ) AS details
  FROM pg_depend dep
  JOIN pg_proc proc ON dep.refobjid = proc.oid
  JOIN pg_namespace func_namespace ON proc.pronamespace = func_namespace.oid
  JOIN pg_attrdef attrdef ON dep.objid = attrdef.oid
  JOIN pg_attribute attr ON attr.attnum = attrdef.adnum AND attr.attrelid = attrdef.adrelid
  JOIN pg_class obj_class ON attr.attrelid = obj_class.oid
  JOIN pg_namespace obj_namespace ON obj_class.relnamespace = obj_namespace.oid
  WHERE obj_namespace.nspname = $5
    AND obj_class.relname = $6

  UNION ALL

  -- Dependencies of views on underlying tables
  SELECT
    'view_table_dependency' AS dependency_type,
    ref_namespace.nspname AS schema,
    ref_table.relname AS name,
    jsonb_build_object(
      'type', 'table',
      'dependent_view', vw_namespace.nspname || '.' || vw.relname,
      'referenced_table', ref_namespace.nspname || '.' || ref_table.relname
    ) AS details
  FROM pg_rewrite rw
  JOIN pg_class vw ON rw.ev_class = vw.oid
  JOIN pg_namespace vw_namespace ON vw.relnamespace = vw_namespace.oid
  JOIN pg_depend dep ON rw.oid = dep.objid
  JOIN pg_class ref_table ON dep.refobjid = ref_table.oid
  JOIN pg_namespace ref_namespace ON ref_table.relnamespace = ref_namespace.oid
  WHERE vw_namespace.nspname = $7
    AND vw.relname = $8
    AND ref_table.oid != vw.oid -- Exclude self-references
)
SELECT DISTINCT
  dependency_type AS type,
  schema,
  name,
  details
FROM dependencies
ORDER BY type, schema, name;`;

export const useTableUpstream = () => {
  const conn = useURLConnection();
  const { schema, table } = useParams<{
    schema: string;
    table: string;
  }>();

  const query = useDynamicQuery(conn!);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const [stats] = await query(GET_UPSTREAM, [
        schema,
        table,
        schema,
        table,
        schema,
        table,
        schema,
        table,
      ]);
      setItems(stats as any[]);
    };
    run();
  }, [conn, schema, table]);

  return {
    schema,
    table,
    items,
    tree:
      items.map((item: any) => ({
        ...item,
      })) || [],
  };
};
