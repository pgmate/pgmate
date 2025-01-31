import { useDynamicQuery } from "hooks/use-query";
import { useAxios } from "hooks/use-axios";
import { usePubSub } from "hooks/use-pubsub";
import { useConnections as useGlobalConnections } from "hooks/use-connections";

// Implement it as backend call
const DELETE_CONNECTION = `
DELETE FROM "pgmate"."connections"
WHERE "name" = $1
`;

export interface ConnectionItem {
  name: string;
  desc: string;
}

export interface ConnectionTarget {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: string;
}

export interface ConnectionData extends ConnectionItem {
  conn: ConnectionTarget;
  ssl: string;
  created_at: string;
  updated_at: string;
}

export const useConnections = () => {
  const axios = useAxios();
  const bus = usePubSub();
  const query = useDynamicQuery("default");

  const { items } = useGlobalConnections();

  const deleteConnection = async (conn: ConnectionItem) => {
    await query(DELETE_CONNECTION, [conn.name]);
    bus.emit("connections::changed");
  };

  const getConnectionData = async (name: string) => {
    const res = await axios.get(`/connections/${name}`);
    return res.data.connection;
  };

  const upsertConnection = async (data: ConnectionData) => {
    await axios.post("/connections", {
      name: data.name,
      desc: data.desc,
      connectionString: `postgres://${data.conn.user}:${data.conn.password}@${data.conn.host}:${data.conn.port}/${data.conn.database}`,
      ssl: data.ssl,
    });
    bus.emit("connections::changed");
  };

  return {
    // Do not allow to modify the default connection in the manager
    connections: items.filter((c) => c.name !== "default"),
    deleteConnection,
    getConnectionData,
    upsertConnection,
  };
};
