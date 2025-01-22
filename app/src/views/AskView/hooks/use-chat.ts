import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAxios } from "hooks/use-axios";
import type { LLMMessage } from "../ask.d";

export const useChat = () => {
  const axios = useAxios();
  const params = useParams<{
    conn: string;
    db: string;
  }>();

  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const messagesRef = useRef<LLMMessage[]>([]);

  const pushMsg = useCallback(
    (msg: LLMMessage) => {
      messagesRef.current.push(msg);
      setMessages((v) => [...v, msg]);
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
        const res = await axios.post(`/ai/ask`, {
          conn: params.conn,
          database: params.db,
          messages: getCleanMessages(),
          options: {
            limit: 500,
          },
        });

        pushMsg({
          id: res.data.id,
          role: "assistant",
          content: res.data.choices[0].message.content,
        });
      } catch (e) {
        console.error("Failed to send message", e);
      }
    },
    [axios, pushMsg]
  );

  return { send, messages };
};
