import { useQuery, useDynamicQuery } from "../../../hooks/use-query";
import { useAxios } from "../../../hooks/use-axios";

const GET_CONNECTIONS = `
SELECT
  "name",
  "desc"
FROM "pgmate"."connections"
ORDER BY "name" ASC
`;

const DELETE_CONNECTION = `
DELETE FROM "pgmate"."connections"
WHERE "name" = $1
`;

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

export const useConnections = () => {
  const axios = useAxios();
  const query = useDynamicQuery("default");
  const { data, reload } = useQuery<ConnectionItem>(
    "default",
    GET_CONNECTIONS,
    []
  );

  const deleteConnection = async (conn: ConnectionItem) => {
    await query(DELETE_CONNECTION, [conn.name]);
    reload();
  };

  const getConnectionData = async (name: string) => {
    const res = await axios.get(`/connections/${name}`);
    return res.data.connection;
  };

  const upsertConnection = async (data: ConnectionData) => {
    await axios.post("/connections", {
      name: data.name,
      desc: data.desc,
      conn: `postgres://${data.conn.user}:${data.conn.password}@${data.conn.host}:${data.conn.port}/${data.conn.database}`,
      ssl: data.ssl,
    });
    await reload();
  };

  return {
    connections: data?.rows || [],
    deleteConnection,
    getConnectionData,
    upsertConnection,
  };
};
