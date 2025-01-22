import { ListItem, ListItemText } from "@mui/material";
import type { LLMUserMessage } from "../ask.d";

interface MessageUserProps {
  message: LLMUserMessage;
}

export const MessageUser: React.FC<MessageUserProps> = ({ message }) => {
  return (
    <ListItem>
      <ListItemText primary={message.content} secondary={"@user"} />
    </ListItem>
  );
};
