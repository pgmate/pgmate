import { PoolClient, Client } from 'pg';

export const getVersion = async (
  client: PoolClient | Client,
): Promise<string> => {
  const { rows: version } = await client.query('SELECT version()');
  return version[0].version;
};

export const getMajorVersion = async (
  client: PoolClient | Client,
): Promise<string> => {
  const version = await getVersion(client);
  return version.split(' ')[1].split('.')[0];
};
