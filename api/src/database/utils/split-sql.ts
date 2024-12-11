const regex = /(?:[^;"']+|"[^"]*"|'[^']*')+/g;

export const splitSql = (sql: string) => {
  const tokens =
    sql
      .match(regex) // Extract query blocks
      ?.map((query) => query.trim()) // Trim whitespace
      .filter((query) => query.length > 0) || [];

  // console.log(tokens);

  let inTransaction = false;
  let inDo = false;

  const statements = tokens.reduce((acc, token) => {
    // First item
    if (acc.length === 0) {
      if (token.toUpperCase().startsWith('BEGIN')) {
        inTransaction = true;
      }
      if (token.toUpperCase().startsWith('DO')) {
        inDo = true;
      }
      return [token];
    }

    // Start a transaction
    if (token.toUpperCase().startsWith('BEGIN')) {
      inTransaction = true;
      return [...acc, `${token};`];
    }

    if (token.toUpperCase().startsWith('COMMIT')) {
      inTransaction = false;
      const statement = acc.pop();
      return [...acc, `${statement} ${token};`];
    }

    if (inTransaction) {
      const statement = acc.pop();
      return [...acc, `${statement} ${token};`];
    }

    return [...acc, `${token};`];
  }, []);

  // console.log(statements);
  // console.log('****');

  return statements;
};
