import { ListItem, ListItemText, Paper } from "@mui/material";
import type { LLMUserMessage } from "../ask.d";

interface MessageUserProps {
  message: LLMUserMessage;
}

export const MessageUser: React.FC<MessageUserProps> = ({ message }) => {
  return (
    <ListItem>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          ml: "40%",
          p: 2,
        }}
      >
        <ListItemText primary={message.content} secondary={"@user"} />
      </Paper>
    </ListItem>
  );
};
