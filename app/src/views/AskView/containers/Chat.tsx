import { useRef, useEffect } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useChat } from "../hooks/use-chat";
import { MessagesList } from "../components/MessagesList";

export const Chat = () => {
  const chat = useChat();
  const promptRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!promptRef.current) return;
    chat.send(promptRef.current.value);
    promptRef.current.value = "";
  };

  // Initial message
  useEffect(() => {
    const timers = [
      setTimeout(() => {
        chat.send("describe the purpose of this db");
      }, 250),
      setTimeout(() => {
        chat.send("Give me the query to calculate current month's sales");
      }, 500),
      setTimeout(() => {
        chat.send("**?");
      }, 750),
      setTimeout(() => {
        chat.send("i want the sales breakdown by product");
      }, 1000),
    ];
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

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
        <MessagesList messages={chat.messages} />
        {/* <div style={{ overflow: "auto" }}>
          <pre style={{ fontSize: 10 }}>
            {JSON.stringify(chat.messages, null, 2)}
          </pre>
        </div> */}
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
        <TextField inputRef={promptRef} multiline maxRows={5} />
        <Stack direction={"row"} justifyContent={"flex-end"} mt={1} spacing={1}>
          <Button variant="outlined">cancel</Button>
          <Button type="submit" variant="contained">
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
