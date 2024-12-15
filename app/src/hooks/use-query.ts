import { useEffect, useRef, useCallback } from "react";
import { usePost } from "./use-axios";

const DEFAULT_DYNAMIC_QUERY_OPTIONS = { disableAnalyze: true };

interface DynamicQueryOptions {
  disableAnalyze: boolean;
}

interface QueryBody {
  conn: string;
  disableAnalyze: boolean;
  queries: Array<{
    statement: string;
    variables: any[];
  }>;
}

interface QueryResult<TRow> {
  data: null | {
    queries: {
      rows: TRow[];
    }[];
  };
  loading: boolean;
  error: any | null;
}

const stableStringify = (obj: any): string =>
  JSON.stringify(obj, (_, value) =>
    typeof value === "object" && value !== null
      ? Object.keys(value)
          .sort()
          .reduce<Record<string, any>>((acc, k) => {
            acc[k] = value[k];
            return acc;
          }, {})
      : value
  );

export const useQueries = (
  conn: string,
  queries: {
    statement: string;
    variables: any[];
  }[]
): {
  loading: boolean;
  error: any | null;
  data: null | { rows: any[] }[];
} => {
  const dedupeRef = useRef<string | null>(null);

  const [refetch, { data, ...result }] = usePost("/query");

  // Triggers refetch on conditions change
  useEffect(() => {
    if (dedupeRef.current === conn) return;
    dedupeRef.current = conn;

    refetch({
      conn,
      disableAnalyze: true,
      queries,
    });
  }, [conn, stableStringify(queries)]);

  return {
    ...result,
    data: data?.queries,
  };
};

export const useQuery = <TRow = any>(
  conn: string,
  statement: string,
  variables: any[]
): {
  loading: boolean;
  error: any | null;
  data: null | {
    query: {
      statement: string;
    };
    rows: TRow[];
    stats: {
      query: string;
    };
  };
  reload: () => void;
} => {
  const dedupeRef = useRef<string | null>(null);

  const [refetch, { data, ...result }] = usePost<QueryBody, QueryResult<TRow>>(
    "/query"
  );

  // Triggers refetch on conditions change
  useEffect(() => {
    if (dedupeRef.current === conn) return;
    dedupeRef.current = conn;

    refetch({
      conn,
      disableAnalyze: true,
      queries: [
        {
          statement,
          variables,
        },
      ],
    });
  }, [conn, statement, stableStringify(variables)]);

  const reload = useCallback(
    (_variables: any[] = variables) => {
      refetch({
        conn,
        disableAnalyze: true,
        queries: [
          {
            statement,
            variables: _variables,
          },
        ],
      });
    },
    [conn, statement, stableStringify(variables)]
  );

  return {
    ...result,
    data: data?.queries?.[0],
    reload,
  };
};

export const useDynamicQuery = (
  conn: string,
  { disableAnalyze = true }: DynamicQueryOptions = DEFAULT_DYNAMIC_QUERY_OPTIONS
) => {
  const [refetch] = usePost<QueryBody, QueryResult<any>>("/query");

  return useCallback(
    <RType = any>(
      statement: string,
      variables: any[] = []
    ): Promise<[RType[], any]> =>
      refetch({
        conn,
        disableAnalyze,
        queries: [
          {
            statement,
            variables,
          },
        ],
      }).then((res: any) => [res.data?.queries?.[0]?.rows, res]),
    [conn]
  );
};

export const useDynamicQueries = (
  conn: string,
  { disableAnalyze = true }: DynamicQueryOptions = DEFAULT_DYNAMIC_QUERY_OPTIONS
) => {
  const [refetch] = usePost<QueryBody, QueryResult<any>>("/query");

  return useCallback(
    (queries: any[]): Promise<any> =>
      refetch({
        conn,
        disableAnalyze,
        queries,
      }).then((res: any) => [res.data?.queries, res]),
    [conn]
  );
};
