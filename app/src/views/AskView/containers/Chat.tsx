import { useRef, useEffect } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useSubscribe } from "hooks/use-pubsub";
import { useChat } from "../hooks/use-chat";
import { MessagesList } from "../components/MessagesList";
import type { LLMAssistantMessage } from "../ask";

export const Chat = () => {
  const chat = useChat();
  const promptRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!promptRef.current) return;
    chat.send(promptRef.current.value);
    promptRef.current.value = "";
  };

  const handleRequestFix = (error: Error) =>
    chat.send(
      `The query in your previous message yields this error: ${error.message}.\nPlease provide a fix.`
    );

  const handleOnChange = (message: LLMAssistantMessage, source: string) => {
    chat.updateSQLMsg(message.id, source);
  };

  // Enter to submit
  // Shift+Enter new line
  const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === "Enter") {
      if (evt.shiftKey) {
        // Allow new line creation
        return;
      }

      // Prevent default behavior and submit for plain Enter
      evt.preventDefault();
      handleSubmit(evt);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  useSubscribe("ask:requestScrollDown", () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",
      }}
    >
      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <MessagesList
          messages={chat.messages}
          onRequestFix={handleRequestFix}
          onChange={handleOnChange}
        />
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </Box>

      {/* Sticky Form */}
      <Stack
        component={"form"}
        onSubmit={handleSubmit}
        p={2}
        sx={{
          position: "sticky",
          bottom: 0,
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          borderColor: "divider",
        }}
      >
        <TextField
          multiline
          autoFocus
          inputRef={promptRef}
          maxRows={5}
          onKeyDown={handleKeyDown}
        />
        <Stack direction={"row"} justifyContent={"flex-end"} mt={1} spacing={1}>
          <Button variant="text" onClick={() => chat.reset()}>
            cancel
          </Button>
          <Button type="submit" variant="contained">
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
