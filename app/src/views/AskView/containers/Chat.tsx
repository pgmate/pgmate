import { useRef, useEffect } from "react";
import { Stack, TextField, Button } from "@mui/material";
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
    <Stack>
      <MessagesList messages={chat.messages} />
      <Stack component={"form"} onSubmit={handleSubmit}>
        <TextField inputRef={promptRef} />
        <Button type="submit">Send</Button>
      </Stack>
      <hr />
      <pre style={{ fontSize: 10 }}>
        {JSON.stringify(chat.messages, null, 2)}
      </pre>
    </Stack>
  );
};
