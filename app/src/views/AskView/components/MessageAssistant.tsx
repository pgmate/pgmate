import { ListItem, ListItemText, Box, Stack } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
// import { usePubSub } from "hooks/use-pubsub";
import { QueryRunner } from "containers/QueryRunner";
import type { LLMAssistantMessage } from "../ask";

interface MessageAssistantProps {
  message: LLMAssistantMessage;
  onChange: (message: LLMAssistantMessage, source: string) => void;
  onRequestFix?: (error: Error) => void;
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
    // Try to catch unended JSON for long response messages that go over the token limit
    try {
      return parseMessage(source + '"}');
    } catch (e1) {
      console.log("error parsing message", e);
      console.log("source", source);
      return {
        type: "text",
        content: source,
      };
    }
  }
};

export const MessageAssistant: React.FC<MessageAssistantProps> = ({
  message,
  onRequestFix,
  onChange,
}) => {
  // const bus = usePubSub();
  const { type, content } = parseMessage(message.content);
  return (
    <ListItem>
      <Stack direction={"row"} flex={1}>
        <Box sx={{ fontSize: 25, p: 2 }}>🤖</Box>
        <Box flex={1}>
          {type === "query" ? (
            <QueryRunner
              source={content}
              runnerId={message.id}
              onRequestFix={onRequestFix}
              onChange={(source) => onChange(message, source)}
            />
          ) : (
            <ListItemText
              primary={
                ["answer", "question"].includes(type) ? (
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                    {content}
                  </ReactMarkdown>
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
