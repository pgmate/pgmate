import { useState } from "react";
import { Icon, IconButton, Box, Tooltip } from "@mui/material";
import { useConnections } from "hooks/use-connections";
import { usePubSub, useSubscribe } from "hooks/use-pubsub";
import { CodeViewer } from "components/CodeViewer";

const useDBInfo = () => {
  const { getDBInfo } = useConnections();
  const [data, setData] = useState(getDBInfo());
  useSubscribe("dbinfo:updated", setData);
  return data;
};

export const PGSchemaInfo = () => {
  const data = useDBInfo();
  const bus = usePubSub();

  if (!data) return;

  return (
    <Tooltip title="Database Info">
      <IconButton
        color="inherit"
        onClick={() =>
          bus.emit("show::details", {
            title: "Database Info",
            subtitle: "This is all we got from the database so far...",
            body: (
              <Box width={500}>
                <CodeViewer
                  code={JSON.stringify(data.schema, null, 2)}
                  language="json"
                  height={500}
                  onMount={(editor) =>
                    editor.getAction("editor.foldLevel2").run()
                  }
                />
              </Box>
            ),
          })
        }
      >
        <Icon>info</Icon>
      </IconButton>
    </Tooltip>
  );
};
