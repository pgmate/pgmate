import { createContext, useCallback } from "react";
import { useGet } from "hooks/use-axios";
import { useSubscribe } from "hooks/use-pubsub";
import { useConnectionParams } from "./hooks/use-connection-params";
import { useDbContext } from "./hooks/use-db-context";
import { ConnectionError } from "./components/ConnectionError";
import type { PGSchema } from "./hooks/pgschema.type";

export const ConnectionContext = createContext<{
  items: Connection[];
  getByName: (name: string, database?: string) => Connection | undefined;
  getSchema: () => PGSchema | null;
}>({
  items: [],
  getByName: () => undefined,
  getSchema: () => null,
});

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const conn = useConnectionParams();
  const getSchema = useDbContext(conn.version !== null, conn.conn, conn.db);

  // Fetches connections and keeps them up-to-date
  const { data, refetch } = useGet("/connections");
  useSubscribe("connections::changed", refetch);

  const getByName = useCallback(
    (name: string, database = "") => {
      // console.log("ConnectionProvider::getByName", name);
      const match = data?.connections?.find((c: Connection) => c.name === name);
      if (database && match) {
        match.database = database;
      }
      return match;
    },
    [data]
  );

  return (
    <ConnectionContext.Provider
      value={{ items: data?.connections || [], getByName, getSchema }}
    >
      {conn.ready ? (
        conn.error ? (
          <ConnectionError error={conn.error} />
        ) : (
          children
        )
      ) : (
        "loading..."
      )}
    </ConnectionContext.Provider>
  );
};
