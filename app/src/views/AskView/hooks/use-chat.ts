import { useCallback, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAxios } from "hooks/use-axios";
import { useStorage } from "hooks/use-storage";
import type { LLMMessage, LLMModel } from "../ask.d";

export const useChat = () => {
  const storage = useStorage();
  const axios = useAxios();
  const params = useParams<{
    conn: string;
    db: string;
  }>();

  // Populate initial messages:
  const initialMessages: LLMMessage[] = storage.getItem("ask.messages") || [];
  const [messages, setMessages] = useState<LLMMessage[]>(initialMessages);
  const messagesRef = useRef<LLMMessage[]>(initialMessages);

  const [limit, setLimit] = useState(500);
  const [model, setModel] = useState<LLMModel>("gpt-4o-mini");
  const [context, setContext] = useState<"compact" | "full">("compact");

  const pushMsg = useCallback(
    (msg: LLMMessage) => {
      messagesRef.current.push(msg);
      setMessages([...messagesRef.current]);
    },
    [messagesRef, setMessages]
  );

  const getCleanMessages = useCallback(
    () =>
      messagesRef.current.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    [messagesRef]
  );

  const send = useCallback(
    async (promptMsg: string) => {
      pushMsg({
        id: `urs-${Date.now()}`,
        role: "user",
        content: promptMsg,
      });

      try {
        const res = await axios.post(
          `/ai/ask`,
          {
            messages: getCleanMessages(),
            options: {
              limit,
              model,
              context,
            },
          },
          {
            headers: {
              "x-pgmate-conn": params.conn,
              "x-pgmate-db": params.db,
            },
          }
        );

        pushMsg({
          id: res.data.id,
          role: "assistant",
          content: res.data.choices[0].message.content,
          usage: res.data.usage,
        });
      } catch (e) {
        console.error("Failed to send message", e);
      }
    },
    [axios, pushMsg, limit, model, context]
  );

  const reset = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
  }, [setMessages, messagesRef]);

  const updateSQLMsg = useCallback(
    (msgId: string, source: string) => {
      messagesRef.current = messagesRef.current.map(($) =>
        $.id === msgId
          ? { ...$, content: JSON.stringify({ query: source }) }
          : $
      );

      setMessages(messagesRef.current);
    },
    [setMessages, messagesRef]
  );

  // Persist messages
  useEffect(() => {
    storage.setItem("ask.messages", messages);
    // console.log("Messages", messages);
  }, [messages, storage]);

  // useEffect(() => {
  //   const foo = setTimeout(() => {
  //     send("recreate the public schema");
  //   }, 250);

  //   return () => {
  //     clearTimeout(foo);
  //   };
  // }, []);

  return {
    messages,
    send,
    reset,
    updateSQLMsg,
    limit,
    setLimit,
    model,
    setModel,
    context,
    setContext,
  };
};
