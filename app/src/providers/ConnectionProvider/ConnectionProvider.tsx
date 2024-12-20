import { createContext, useCallback } from "react";
import { useGet } from "../../hooks/use-axios";
import { useSubscribe } from "../../hooks/use-pubsub";

export interface Connection {
  name: string;
  desc: string;
  ssl: boolean;
  created_at: string;
  updated_at: string;
}

export const ConnectionContext = createContext<{
  items: Connection[];
  getByName: (name: string) => Connection | undefined;
}>({
  items: [],
  getByName: () => undefined,
});

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Fetches connections and keeps them up-to-date
  const { data, refetch } = useGet("/connections");
  useSubscribe("connections::changed", refetch);

  const getByName = useCallback(
    (name: string) => {
      // console.log("ConnectionProvider::getByName", name);
      return data?.connections?.find((c: Connection) => c.name === name);
    },
    [data]
  );

  return (
    <ConnectionContext.Provider
      value={{ items: data?.connections || [], getByName }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
