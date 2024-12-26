import { useURLConnection } from "../../hooks/use-connections";
import { ConnectionSchema } from "./ConnectionSchema";

export const ConnectionSchemaWrapper = () => {
  const conn = useURLConnection();
  return conn ? <ConnectionSchema conn={conn} /> : null;
};
