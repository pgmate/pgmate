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

const estimateLLMTokens = (json: any): number => {
  // Convert the JSON object to a string
  const jsonString = JSON.stringify(json);

  // Roughly estimate the number of tokens based on the length of the string
  // Assuming 4 characters per token on average (a common heuristic)
  const avgCharsPerToken = 4;

  return Math.ceil(jsonString.length / avgCharsPerToken);
};

export const PGSchemaContext = () => {
  const schema = usePGSchema();
  const bus = usePubSub();

  if (!schema) return;

  const filteredSchema = filterSchema(schema);
  const tokens = estimateLLMTokens(filteredSchema);
  const source = JSON.stringify(filteredSchema, null, 2);

  return (
    <Tooltip title="Database AI Context">
      <IconButton
        color="inherit"
        onClick={() =>
          bus.emit("show::details", {
            title: "Database AI Context",
            subtitle: `Paste this into your LLM to run Text2SQL magic (${tokens} tokens)`,
            body: (
              <Box width={500}>
                <CodeViewer
                  code={source}
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
