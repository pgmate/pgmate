import { ListItem, ListItemText, Box, Stack } from "@mui/material";
import { CodeViewer } from "components/CodeViewer";
import ReactMarkdown from "react-markdown";
import type { LLMAssistantMessage } from "../ask";

interface MessageAssistantProps {
  message: LLMAssistantMessage;
}

const parseMessage = (source: string) => {
  try {
    const parsed = JSON.parse(source);
    for (const key of ["question", "answer", "query"]) {
      if (parsed[key]?.length > 0) {
        return {
          type: key,
          content: parsed[key],
        };
      }
    }

    return {
      type: "text",
      content: source,
    };
  } catch (e) {
    console.log("error parsing message", e);
    console.log("source", source);
    return {
      type: "text",
      content: source,
    };
  }
};

export const MessageAssistant: React.FC<MessageAssistantProps> = ({
  message,
}) => {
  const { type, content } = parseMessage(message.content);
  return (
    <ListItem>
      <Stack direction={"row"} flex={1}>
        <Box sx={{ fontSize: 25, p: 2 }}>🤖</Box>
        <Box flex={1}>
          {type === "query" ? (
            <ListItemText
              primary={<CodeViewer language="sql" code={content} />}
              secondary={`@assistant`}
            />
          ) : (
            <ListItemText
              primary={
                ["answer", "question"].includes(type) ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  content
                )
              }
              secondary={`@assistant - ${type}`}
            />
          )}
        </Box>
      </Stack>
    </ListItem>
  );
};
