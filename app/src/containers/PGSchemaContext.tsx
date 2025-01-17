import { useState } from "react";
import { IconButton, Box, Tooltip } from "@mui/material";
import { useConnections } from "hooks/use-connections";
import { usePubSub, useSubscribe } from "hooks/use-pubsub";
import { CodeViewer } from "components/CodeViewer";
import { filterSchema } from "./ai-filter-schema";

const usePGSchema = () => {
  const { getSchema } = useConnections();
  const [schema, setSchema] = useState(getSchema());
  useSubscribe("pgschema:updated", setSchema);
  return schema;
};

export const PGSchemaContext = () => {
  const schema = usePGSchema();
  const bus = usePubSub();

  if (!schema) return;

  return (
    <Tooltip title="Database AI Context">
      <IconButton
        aria-label="show database context"
        color="inherit"
        onClick={() =>
          bus.emit("show::details", {
            title: "Database AI Context",
            body: (
              <Box width={500}>
                <CodeViewer
                  code={JSON.stringify(filterSchema(schema), null, 2)}
                  language="json"
                  height={500}
                  onMount={(editor) => {
                    editor.getAction("editor.foldLevel2").run();
                    editor.getAction("editor.foldLevel4").run();
                    editor.getAction("editor.foldLevel6").run();
                  }}
                />
              </Box>
            ),
          })
        }
      >
        🤖
      </IconButton>
    </Tooltip>
  );
};
