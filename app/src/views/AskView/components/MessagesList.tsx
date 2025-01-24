import { List } from "@mui/material";
import type { LLMMessage, LLMUserMessage, LLMAssistantMessage } from "../ask.d";
import { MessageUser } from "./MessageUser";
import { MessageAssistant } from "./MessageAssistant";

interface MessagesListProps {
  messages: LLMMessage[];
  onChange: (message: LLMAssistantMessage, source: string) => void;
  onRequestFix?: (error: Error) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  onRequestFix,
  onChange,
}) => {
  console.log("@render::MessagesList");
  return (
    <List>
      {messages.map((message, index) =>
        message.role === "user" ? (
          <MessageUser
            key={index}
            message={message as LLMUserMessage}
            isLast={index === messages.length - 1}
          />
        ) : (
          <MessageAssistant
            key={index}
            message={message as LLMAssistantMessage}
            onRequestFix={onRequestFix}
            onChange={onChange}
          />
        )
      )}
    </List>
  );
};
