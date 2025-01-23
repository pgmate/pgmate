import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { ListItem, ListItemText, Box, Paper } from "@mui/material";
import { SendingIndicator } from "./SendingIndicator";
import { TypingIndicator } from "./TypingIndicator";
import type { LLMUserMessage } from "../ask.d";

interface MessageUserProps {
  message: LLMUserMessage;
  isLast: boolean;
}

export const MessageUser: React.FC<MessageUserProps> = ({
  message,
  isLast,
}) => {
  const [showTyping, setShowTyping] = useState(false);

  return (
    <ListItem sx={{ flexDirection: "column", alignItems: "flex-end" }}>
      <Box
        sx={{
          flex: 1,
          minWidth: "30%",
          maxWidth: "70%",
        }}
      >
        <Paper elevation={3} sx={{ p: 2, position: "relative" }}>
          <ListItemText
            primary={
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {message.content}
              </ReactMarkdown>
            }
          />
          <Box sx={{ position: "absolute", right: 0, bottom: 0 }}>
            <SendingIndicator
              animate={isLast}
              onAnimationComplete={() => setShowTyping(true)}
            />
          </Box>
        </Paper>
      </Box>
      {showTyping && isLast ? <TypingIndicator /> : null}
    </ListItem>
  );
};
