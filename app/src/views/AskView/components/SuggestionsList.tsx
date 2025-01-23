import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Icon,
} from "@mui/material";

interface SuggestionsListProps {
  onSelectMessage: (message: string) => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  onSelectMessage,
}) => {
  const suggestions = [
    "Explain me the purpose of this database in a single short sentence.",
    'Create a schema "school" and build the tables structure to manage students, classrooms, teachers and test.',
    'Analyze the "public" schema and suggest missing foreign keys.',
    'Analyze the "public" schema and create a seed script for a load test.',
    'List all the tables in the "public" schema.',
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 10 }}>
      <Typography variant="h3" gutterBottom>
        🤖 Hello, can I help you with these tasks?
      </Typography>
      <List disablePadding sx={{ ml: 2 }}>
        {suggestions.map((message, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => onSelectMessage(message)}>
              <Icon sx={{ mr: 2 }}>send</Icon>
              <ListItemText primary={message} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
