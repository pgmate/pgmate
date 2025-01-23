import { useRef, useState } from "react";
import { Stack, Button, Icon } from "@mui/material";
import { useDynamicQueries } from "hooks/use-query";
import { useURLConnection } from "hooks/use-connections";
import { usePubSub } from "hooks/use-pubsub";
import { ClipCopy } from "components/ClipCopy";
import { Editor } from "./Editor";
import { QueryResults } from "./QueryResults";
import { QueryEmpty } from "./QueryEmpty";
import { QueryError } from "./QueryError";

interface QueryRunnerProps {
  source?: string;
  onChange?: (source: string) => void;
  onRequestFix?: (error: Error) => void;
  onQueryCompleted?: (results: any) => void;
}

export const QueryRunner: React.FC<QueryRunnerProps> = ({
  source,
  onChange,
  onRequestFix,
  onQueryCompleted,
}) => {
  const bus = usePubSub();
  const conn = useURLConnection();
  const query = useDynamicQueries(conn!, { disableAnalyze: false });
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<any | null>(null);

  const sourceRef = useRef(source);

  const run = async (code: string) => {
    setResults(null);
    setError(null);

    try {
      const [results] = await query([
        {
          statement: code,
          variables: [],
        },
      ]);

      if (results[0].error) {
        console.error(results[0].error);
        setError(results[0].error);
      } else {
        console.table(results[0].rows);
        setResults(results[0]);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setTimeout(() => {
        onQueryCompleted?.(results);

        // Request a schema update for DDL queries
        if (
          [
            "UPDATE",
            "DELETE",
            "INSERT",
            "MERGE",
            "CREATE",
            "ALTER",
            "DROP",
            "TRUNCATE",
            "RENAME",
            "COMMIT",
            "ROLLBACK",
            "GRANT",
            "REVOKE",
            "SET",
            "EXECUTE",
          ].some((keyword) => code.toUpperCase().includes(keyword))
        ) {
          bus.emit("dbinfo:refresh");
        }
      }, 100);
    }
  };

  return (
    <Stack>
      <Editor
        source={source || ""}
        onChange={(source) => {
          sourceRef.current = source;
          onChange?.(source);
        }}
        onRequestRun={run}
      />
      {error && <QueryError error={error} onRequestFix={onRequestFix} />}
      <Stack direction={"row"} spacing={2} justifyContent={"flex-end"} mt={1}>
        <ClipCopy content={sourceRef.current || ""} size="small" />
        <Button
          size={"small"}
          variant="contained"
          endIcon={<Icon>play_circle</Icon>}
          onClick={() => run(sourceRef.current || "")}
        >
          Run
        </Button>
      </Stack>
      {results &&
        (results.rows?.length ? (
          <QueryResults data={results} />
        ) : (
          <QueryEmpty />
        ))}
    </Stack>
  );
};
