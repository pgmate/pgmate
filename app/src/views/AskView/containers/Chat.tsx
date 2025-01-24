import { useRef, useEffect } from "react";
import { Box, Stack, TextField, Button, Icon } from "@mui/material";
import { useSubscribe, usePubSub } from "hooks/use-pubsub";
import { useChat } from "../hooks/use-chat";
import { useUsage } from "../hooks/use-usage";
import { useEstimate } from "../hooks/use-estimate";
import { MessagesList } from "../components/MessagesList";
import { SuggestionsList } from "../components/SuggestionsList";
import { ModelSelector } from "../components/ModelSelector";
import { ContextSelector } from "../components/ContextSelector";
import { LimitSelector } from "../components/LimitSelector";
import type { LLMAssistantMessage } from "../ask";

export const Chat = () => {
  const bus = usePubSub();
  const chat = useChat();
  const usage = useUsage(chat.messages);
  const estimate = useEstimate(usage);
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

  useSubscribe("ask:requestScrollDown", () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  );

  useEffect(() => {
    setTimeout(() => {
      bus.emit("ask:usage", usage);
      bus.emit("ask:estimate", estimate);
    });
  }, [usage, estimate]);

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
        {chat.messages.length === 0 && (
          <SuggestionsList onSelectMessage={chat.send} />
        )}
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
          placeholder="How can I help you?"
        />
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          mt={1}
          spacing={1}
        >
          <Stack
            direction={"row"}
            justifyContent={"flex-start"}
            mt={1}
            spacing={3}
          >
            <ModelSelector
              model={chat.model}
              setModel={chat.setModel}
              options={["gpt-4o", "gpt-4o-mini"]}
            />
            <ContextSelector
              context={chat.context}
              setContext={chat.setContext}
            />
            <LimitSelector limit={chat.limit} setLimit={chat.setLimit} />
          </Stack>
          <Stack
            direction={"row"}
            justifyContent={"flex-end"}
            mt={1}
            spacing={1}
          >
            <Button variant="text" onClick={() => chat.reset()}>
              New Chat
            </Button>
            <Button
              type="submit"
              variant="contained"
              endIcon={<Icon>send</Icon>}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
