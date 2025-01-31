import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useURLConnection } from "hooks/use-connections";
import { useDynamicQuery } from "hooks/use-query";

const GET_STATS = `
SELECT
    c.relname AS table_name,
    pg_stat_get_live_tuples(c.oid) AS row_count,
    pg_total_relation_size(c.oid) AS data_size,
    pg_indexes_size(c.oid) AS indexes_size,
    st.seq_scan,
    st.idx_scan,
    st.n_tup_ins AS inserts,
    st.n_tup_upd AS updates,
    st.n_tup_del AS deletes,
    -- Number of indexes
    (SELECT COUNT(*) 
     FROM pg_index idx 
     WHERE idx.indrelid = c.oid) AS number_of_indexes,
    -- Number of constraints
    (SELECT COUNT(*) 
     FROM pg_constraint con 
     WHERE con.conrelid = c.oid) AS number_of_constraints,
    -- Number of triggers
    (SELECT COUNT(*) 
     FROM pg_trigger trg 
     WHERE trg.tgrelid = c.oid AND NOT trg.tgisinternal) AS number_of_triggers,
    -- Table owner
    (SELECT rolname 
     FROM pg_roles 
     WHERE pg_roles.oid = c.relowner) AS table_owner,
    -- Last auto-vacuum time
    st.last_autovacuum AS last_autovacuum,
    -- Last auto-analyze time
    st.last_autoanalyze AS last_autoanalyze,
    -- Number of foreign keys referencing this table
    (SELECT COUNT(*) 
     FROM pg_constraint con 
     WHERE con.confrelid = c.oid AND con.contype = 'f') AS foreign_keys_referencing,
    -- Number of foreign keys in this table
    (SELECT COUNT(*) 
     FROM pg_constraint con 
     WHERE con.conrelid = c.oid AND con.contype = 'f') AS foreign_keys_defined,
    -- Number of dependent views
    (SELECT COUNT(*) 
     FROM pg_views v 
     WHERE v.definition ILIKE '%' || c.relname || '%') AS dependent_views
FROM
    pg_class c
JOIN
    pg_namespace n ON n.oid = c.relnamespace
JOIN
    pg_stat_user_tables st ON st.relname = c.relname AND st.schemaname = n.nspname
WHERE
    n.nspname = $1
    AND c.relname = $2
`;

interface Stats {
  row_count: number;
  data_size: number;
  indexes_size: number;
  seq_scan: number;
  idx_scan: number;
  inserts: number;
  updates: number;
  deletes: number;
  number_of_indexes: number;
  number_of_constraints: number;
  number_of_triggers: number;
  table_owner: string;
  last_autovacuum: string;
  last_autoanalyze: string;
  foreign_keys_referencing: number;
  foreign_keys_defined: number;
  dependent_views: number;
}

export const useTableInfo = () => {
  const conn = useURLConnection();
  const { schema, table } = useParams<{
    schema: string;
    table: string;
  }>();

  const query = useDynamicQuery(conn!);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [stats] = await query(GET_STATS, [schema, table]);
        setStats(stats[0] as Stats);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [conn, schema, table]);

  return {
    loading,
    schema,
    table,
    stats,
  };
};
