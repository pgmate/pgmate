import { useContext } from "react";
import { useMatch } from "react-router-dom";
import { ConnectionContext, Connection } from "../providers/ConnectionProvider";

export const useConnections = () => useContext(ConnectionContext);

export const useConnection = (name: string): Connection | undefined => {
  const { getByName } = useConnections();
  return getByName(name);
};

export const useURLConnection = (): Connection | undefined => {
  const { getByName } = useConnections();
  const match = useMatch("/:conn/*");
  return match?.params.conn ? getByName(match.params.conn) : undefined;
};
