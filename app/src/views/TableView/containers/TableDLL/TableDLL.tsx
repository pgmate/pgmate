import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Stack, Typography } from "@mui/material";
import { usePost } from "hooks/use-axios";
import { CodeViewer } from "components/CodeViewer";

export const TableDLL = () => {
  const { conn, schema, table } = useParams<{
    conn: string;
    schema: string;
    table: string;
  }>();
  const [fetch] = usePost("/pg_dump/tables");

  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch(
      {
        schema,
        tables: [table],
      },
      {
        "x-pgmate-conn": conn,
      }
    ).then((res: any) => {
      setData(res.data);
    });
  }, [conn, schema, table]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <Stack direction={"row"} spacing={1}>
      <Stack flex={1} spacing={1}>
        <Stack>
          <Typography variant="h4">pg_dump:</Typography>
          <Typography variant="caption">
            Dump using the official <code>pg_dump</code> included in the
            Dockerimage.
          </Typography>
          <Typography variant="caption">
            🫣 This is super stable, but the Docker image grows up to 2.4Gb! 🫣
          </Typography>
        </Stack>
        <CodeViewer code={data.sql_pg} language="sql" height={300} />
      </Stack>
      <Stack flex={1} spacing={1}>
        <Stack>
          <Typography variant="h4">ts_dump:</Typography>
          <Typography variant="caption">
            Dump obtained by custom queries and TypeScript logic.
          </Typography>
          <Typography variant="caption">
            🚧 This is highly experimental but it is fast and it keeps the final
            build slim (~200Mb) 🚧
          </Typography>
        </Stack>
        <CodeViewer code={data.sql_ts} language="sql" height={300} />
      </Stack>
    </Stack>
  );
};
