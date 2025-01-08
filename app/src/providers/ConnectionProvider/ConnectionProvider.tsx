import { createContext, useCallback } from "react";
import { useGet } from "hooks/use-axios";
import { useSubscribe } from "hooks/use-pubsub";
import { useConnectionParams } from "./hooks/use-connection-params";
import { ConnectionError } from "./components/ConnectionError";

export const ConnectionContext = createContext<{
  items: Connection[];
  getByName: (name: string, database?: string) => Connection | undefined;
}>({
  items: [],
  getByName: () => undefined,
});

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const conn = useConnectionParams();

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
      value={{ items: data?.connections || [], getByName }}
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
