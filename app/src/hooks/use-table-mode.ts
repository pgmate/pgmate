import { useMatch } from "react-router-dom";

export const useTableMode = () => {
  const match = useMatch("/:conn/:db/:schema/:table/:mode/*");
  return {
    conn: match?.params.conn,
    db: match?.params.db,
    schema: match?.params.schema,
    table: match?.params.table,
    mode: match?.params.mode || "data",
  };
};
