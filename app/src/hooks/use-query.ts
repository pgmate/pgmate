import { useEffect, useRef, useCallback } from "react";
import { usePost } from "hooks/use-axios";

const DEFAULT_DYNAMIC_QUERY_OPTIONS = { disableAnalyze: true };

interface DynamicQueryOptions {
  name?: string;
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
  conn: string | Connection,
  queries: {
    statement: string;
    variables: any[];
  }[]
): {
  loading: boolean;
  error: any | null;
  data: null | { rows: any[] }[];
  refetch: () => void;
} => {
  const dedupeRef = useRef<string | Connection | null>(null);

  const [refetch, { data, ...result }] = usePost("/query?useQueries");

  // Triggers refetch on conditions change
  useEffect(() => {
    if (dedupeRef.current === conn) return;
    dedupeRef.current = conn;

    refetch(
      {
        disableAnalyze: true,
        queries,
      },
      {
        "x-pgmate-conn": typeof conn === "string" ? conn : conn.name,
        "x-pgmate-db": typeof conn === "string" ? undefined : conn.database,
      }
    );
  }, [conn, stableStringify(queries)]);

  return {
    ...result,
    data: data?.queries,
    refetch: () =>
      refetch(
        {
          disableAnalyze: true,
          queries,
        },
        {
          "x-pgmate-conn": typeof conn === "string" ? conn : conn.name,
          "x-pgmate-db": typeof conn === "string" ? undefined : conn.database,
        }
      ),
  };
};

export const useQuery = <TRow = any>(
  conn: string | Connection,
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
  const dedupeRef = useRef<string | Connection | null>(null);

  const [refetch, { data, ...result }] = usePost<QueryBody, QueryResult<TRow>>(
    "/query?useQuery"
  );

  // Triggers refetch on conditions change
  useEffect(() => {
    if (dedupeRef.current === conn) return;
    dedupeRef.current = conn;

    refetch(
      {
        disableAnalyze: true,
        queries: [
          {
            statement,
            variables,
          },
        ],
      },
      {
        "x-pgmate-conn": typeof conn === "string" ? conn : conn.name,
        "x-pgmate-db": typeof conn === "string" ? undefined : conn.database,
      }
    );
  }, [conn, statement, stableStringify(variables)]);

  const reload = useCallback(
    (_variables: any[] = variables) => {
      refetch(
        {
          disableAnalyze: true,
          queries: [
            {
              statement,
              variables,
            },
          ],
        },
        {
          "x-pgmate-conn": typeof conn === "string" ? conn : conn.name,
          "x-pgmate-db": typeof conn === "string" ? undefined : conn.database,
        }
      );
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
  conn: string | Connection,
  {
    name = "useDynamicQuery",
    disableAnalyze = true,
  }: DynamicQueryOptions = DEFAULT_DYNAMIC_QUERY_OPTIONS
) => {
  const [refetch] = usePost<QueryBody, QueryResult<any>>(`/query?${name}`);

  return useCallback(
    <RType = any>(
      statement: string,
      variables: any[] = []
    ): Promise<[RType[], any]> =>
      refetch(
        {
          disableAnalyze,
          queries: [
            {
              statement,
              variables,
            },
          ],
        },
        {
          "x-pgmate-conn": typeof conn === "string" ? conn : conn.name,
          "x-pgmate-db": typeof conn === "string" ? undefined : conn.database,
        }
      ).then((res: any) => [res.data?.queries?.[0]?.rows, res]),
    [conn]
  );
};

export const useDynamicQueries = (
  conn: string | Connection,
  { disableAnalyze = true }: DynamicQueryOptions = DEFAULT_DYNAMIC_QUERY_OPTIONS
) => {
  const [refetch] = usePost<QueryBody, QueryResult<any>>(
    "/query?useDynamicQueries"
  );

  return useCallback(
    (queries: any[]): Promise<any> =>
      refetch(
        {
          disableAnalyze,
          queries,
        },
        {
          "x-pgmate-conn":
            typeof conn === "string" ? conn : conn?.name || "no-conn",
          "x-pgmate-db":
            typeof conn === "string" ? undefined : conn?.database || "no-db",
        }
      ).then((res: any) => [res.data?.queries, res]),
    [conn]
  );
};
