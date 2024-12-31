import { useContext } from "react";
import { useMatch } from "react-router-dom";
import { ConnectionContext } from "providers/ConnectionProvider";

export interface ConnectionItem {
  name: string;
  desc: string;
}

export interface ConnectionData extends ConnectionItem {
  conn: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  ssl: boolean;
  created_at: string;
  updated_at: string;
}

export const useConnections = () => useContext(ConnectionContext);

export const useConnection = (
  name: string,
  database?: string
): Connection | undefined => {
  const { getByName } = useConnections();
  return getByName(name, database);
};

export const useURLConnection = (): Connection | undefined => {
  const { getByName } = useConnections();
  const match = useMatch("/:conn/:db/*");
  return match?.params.conn && match?.params.db
    ? getByName(match.params.conn, match?.params.db)
    : undefined;
};
