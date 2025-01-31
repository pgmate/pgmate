import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useURLConnection } from "hooks/use-connections";
import { useDynamicQuery } from "hooks/use-query";

const GET_DOWNSTREAM = `
WITH dependencies AS (
  -- Direct and indirect dependencies (exclude sequences)
  SELECT
    dep.deptype,
    obj_class.relkind AS dependent_type,
    obj_namespace.nspname AS dependent_schema,
    obj_class.relname AS dependent_name,
    ref_class.relname AS referenced_table,
    ref_namespace.nspname AS referenced_schema,
    CASE
      WHEN dep.deptype = 'n' AND obj_class.relkind = 'i' THEN (
        SELECT jsonb_build_object(
          'type', 'index',
          'index_name', obj_class.relname,
          'index_type', am.amname,
          'columns', string_agg(att.attname, ', ' ORDER BY k.n),
          'constraints', CASE
            WHEN i.indisunique THEN 'UNIQUE'
            WHEN i.indisprimary THEN 'PRIMARY KEY'
            ELSE NULL
          END
        )
        FROM pg_index i
        JOIN pg_attribute att ON att.attnum = ANY(i.indkey) AND att.attrelid = i.indrelid
        JOIN pg_am am ON obj_class.relam = am.oid
        CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(indkey, n)
        WHERE obj_class.oid = i.indexrelid
        GROUP BY obj_class.relname, am.amname, i.indisunique, i.indisprimary
      )
      WHEN dep.deptype = 'n' AND obj_class.relkind IN ('v', 'm') THEN NULL
      ELSE NULL
    END AS details
  FROM pg_depend dep
  JOIN pg_class obj_class ON dep.objid = obj_class.oid
  JOIN pg_namespace obj_namespace ON obj_class.relnamespace = obj_namespace.oid
  JOIN pg_class ref_class ON dep.refobjid = ref_class.oid
  JOIN pg_namespace ref_namespace ON ref_class.relnamespace = ref_namespace.oid
  WHERE ref_namespace.nspname = $1
    AND ref_class.relname = $2
    AND dep.deptype != 'i'
    AND obj_class.oid <> ref_class.oid
    AND obj_class.relkind <> 'S'  -- exclude sequences

  UNION ALL

  -- Foreign key relationships
  SELECT
    'f' AS deptype,
    'r' AS dependent_type,
    fk_table_ns.nspname AS dependent_schema,
    fk_table.relname AS dependent_name,
    pk_table.relname AS referenced_table,
    pk_table_ns.nspname AS referenced_schema,
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
    AND pk_table_ns.nspname = $1
    AND pk_table.relname = $2
  GROUP BY con.conname, fk_table_ns.nspname, fk_table.relname, pk_table_ns.nspname, pk_table.relname

  UNION ALL

  -- Dependencies through views/materialized views (exclude self and sequences)
  SELECT
    'v' AS deptype,
    vw_class.relkind AS dependent_type,
    vw_namespace.nspname AS dependent_schema,
    vw_class.relname AS dependent_name,
    tbl_class.relname AS referenced_table,
    tbl_namespace.nspname AS referenced_schema,
    NULL AS details
  FROM pg_rewrite rw
  JOIN pg_class vw_class ON rw.ev_class = vw_class.oid
  JOIN pg_namespace vw_namespace ON vw_class.relnamespace = vw_namespace.oid
  JOIN pg_depend dep ON dep.objid = rw.oid
  JOIN pg_class tbl_class ON dep.refobjid = tbl_class.oid
  JOIN pg_namespace tbl_namespace ON tbl_class.relnamespace = tbl_namespace.oid
  WHERE tbl_namespace.nspname = $1
    AND tbl_class.relname = $2
    AND vw_class.oid <> tbl_class.oid
    AND vw_class.relkind <> 'S'  -- just in case
)
SELECT
  DISTINCT dependent_type AS type,
  dependent_schema AS schema,
  dependent_name AS name,
  CASE dependent_type
    WHEN 'r' THEN 'Table'
    WHEN 'v' THEN 'View'
    WHEN 'm' THEN 'Materialized View'
    WHEN 'i' THEN 'Index'
    WHEN 'S' THEN 'Sequence'
    WHEN 'f' THEN 'Foreign Table'
    WHEN 'p' THEN 'Partitioned Table'
    ELSE 'Other'
  END AS info,
  details
FROM dependencies
ORDER BY type, schema, name;`;

export const useTableDownstream = () => {
  const conn = useURLConnection();
  const { schema, table } = useParams<{
    schema: string;
    table: string;
  }>();

  const query = useDynamicQuery(conn!);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const [items] = await query(GET_DOWNSTREAM, [schema, table]);
      setItems(items as any[]);
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
        // name: getItemName(item),
      })) || [],
  };
};
