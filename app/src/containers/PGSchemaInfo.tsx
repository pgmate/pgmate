import { useState } from "react";
import { Icon, IconButton, Box, Tooltip } from "@mui/material";
import { useConnections } from "hooks/use-connections";
import { usePubSub, useSubscribe } from "hooks/use-pubsub";
import { CodeViewer } from "components/CodeViewer";

const usePGSchema = () => {
  const { getSchema } = useConnections();
  const [schema, setSchema] = useState(getSchema());
  useSubscribe("pgschema:updated", setSchema);
  return schema;
};

export const PGSchemaInfo = () => {
  const schema = usePGSchema();
  const bus = usePubSub();

  if (!schema) return;

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
                  code={JSON.stringify(schema, null, 2)}
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
