export const parsePGString = (connectionString) => {
  const url = new URL(connectionString);

  return {
    host: url.hostname,
    port: url.port || '5432',
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  };
};
