import { useCallback, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAxios } from "hooks/use-axios";
import { useStorage } from "hooks/use-storage";
import type { LLMModel, LLMMessage } from "../ask.d";

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

  const [inputLimit, setInputLimit] = useState(10);
  const [outputLimit, setOutputLimit] = useState(500);
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
    (limit = 10) =>
      messagesRef.current.slice(-limit).map((msg) => ({
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
            messages: getCleanMessages(inputLimit),
            options: {
              limit: outputLimit,
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
          model,
          content: res.data.choices[0].message.content,
          usage: res.data.usage,
        });
      } catch (e) {
        console.error("Failed to send message", e);
      }
    },
    [axios, pushMsg, inputLimit, outputLimit, model, context]
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

      // setMessages(messagesRef.current);
      storage.setItem("ask.messages", messagesRef.current);
    },
    [setMessages, messagesRef]
  );

  // Persist messages
  useEffect(() => {
    storage.setItem("ask.messages", messagesRef.current);
    // console.log("Messages", messagesRef.current);
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
    inputLimit,
    setInputLimit,
    outputLimit,
    setOutputLimit,
    model,
    setModel,
    context,
    setContext,
  };
};
