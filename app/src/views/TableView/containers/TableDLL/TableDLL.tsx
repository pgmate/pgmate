import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePost } from "../../../../hooks/use-axios";
import { CodeViewer } from "../../../../components/CodeViewer";

export const TableDLL = () => {
  const { conn, schema, table } = useParams<{
    conn: string;
    schema: string;
    table: string;
  }>();
  const [fetch] = usePost("/pg_dump/tables");

  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch({
      conn,
      schema,
      tables: [table],
    }).then((res: any) => {
      setData(res.data);
    });
  }, [conn, schema, table]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <CodeViewer code={data.sql} language="sql" height={300} />;
};
