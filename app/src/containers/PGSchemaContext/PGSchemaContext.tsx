import { useState, useEffect } from "react";
import { IconButton, Tooltip, Typography, Stack } from "@mui/material";
import { useConnections } from "hooks/use-connections";
import { usePubSub, useSubscribe } from "hooks/use-pubsub";
import { CodeViewer } from "components/CodeViewer";
import { ClipCopy } from "components/ClipCopy";

const useDBInfo = () => {
  const { getDBInfo } = useConnections();
  const [data, setData] = useState(getDBInfo());
  useSubscribe("dbinfo:updated", setData);
  return data;
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
  const data = useDBInfo();
  const bus = usePubSub();

  const handleClick = () =>
    bus.emit("show::details", {
      title: "Database AI Context",
      subtitle: `Paste this into your LLM to run Text2SQL magic.`,
      body: (
        <Stack width={500} spacing={2}>
          <Stack>
            <Stack
              direction={"row"}
              spacing={2}
              justifyContent={"space-between"}
            >
              <Stack>
                <Typography variant="body1" sx={{ lineHeight: 1 }}>
                  <b>Essential:</b> good for o1-mini and table selection
                  <br />
                  <Typography variant="caption">
                    (~{estimateLLMTokens(data?.ai.compact)} tokens)
                  </Typography>
                </Typography>
              </Stack>
              <ClipCopy content={JSON.stringify(data?.ai.compact)} />
            </Stack>
            <CodeViewer
              disableCopy
              code={JSON.stringify(data?.ai.compact, null, 2)}
              language="json"
              height={200}
              onMount={(editor) => {
                editor.getAction("editor.foldLevel2").run();
                editor.getAction("editor.foldLevel4").run();
                editor.getAction("editor.foldLevel6").run();
              }}
            />
          </Stack>
          <Stack>
            <Stack
              direction={"row"}
              spacing={2}
              justifyContent={"space-between"}
            >
              <Stack>
                <Typography variant="body1" sx={{ lineHeight: 1 }}>
                  <b>Full:</b> good for o1 and Text2SQL
                  <br />
                  <Typography variant="caption">
                    (~{estimateLLMTokens(data?.ai.full)} tokens)
                  </Typography>
                </Typography>
              </Stack>
              <ClipCopy content={JSON.stringify(data?.ai.full)} />
            </Stack>
            <CodeViewer
              disableCopy
              code={JSON.stringify(data?.ai.full, null, 2)}
              language="json"
              height={200}
              onMount={(editor) => {
                editor.getAction("editor.foldLevel2").run();
                editor.getAction("editor.foldLevel4").run();
                editor.getAction("editor.foldLevel6").run();
              }}
            />
          </Stack>
        </Stack>
      ),
    });

  // Temporary hack to auto-trigger the context
  useEffect(() => {
    if (data) {
      handleClick();
    }
  }, [data]);

  if (!data) return;

  return (
    <Tooltip title="Database AI Context">
      <IconButton color="inherit" onClick={handleClick}>
        🤖
      </IconButton>
    </Tooltip>
  );
};
