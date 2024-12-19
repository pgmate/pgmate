import React from "react";
import {
  Box,
  List,
  ListItem,
  IconButton,
  Typography,
  Icon,
  Alert,
  AlertTitle,
} from "@mui/material";

export interface ConnectionItem {
  name: string;
  desc: string;
}

interface ConnectionsListProps {
  items: ConnectionItem[];
  onDisclose?: (connection: ConnectionItem) => void;
  onRequestEdit?: (connection: ConnectionItem) => void;
  onRequestDelete?: (connection: ConnectionItem) => void;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  items,
  onDisclose,
  onRequestEdit,
  onRequestDelete,
}) => {
  return (
    <>
      {items.length === 0 && (
        <Alert severity="info">
          <AlertTitle>No connections found</AlertTitle>
          <Box>
            You can add custom connections to any Postgres compatible database,
            on your machine or in the Cloud.
          </Box>
        </Alert>
      )}
      {items.length > 0 && (
        <List
          sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper" }}
        >
          {items.map((connection, index) => (
            <ListItem
              key={connection.name}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  index === items.length - 1 ? "none" : "1px solid lightgray", // No delimiter for the last item
              }}
            >
              {/* Clickable Row */}
              <Box
                onClick={() => onDisclose?.(connection)}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  cursor: onDisclose ? "pointer" : "default",
                  paddingRight: 2,
                }}
              >
                <Typography variant="subtitle1">{connection.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {connection.desc}
                </Typography>
              </Box>

              {/* Action Icons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {onRequestEdit && (
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      onRequestEdit(connection);
                    }}
                  >
                    <Icon>edit</Icon>
                  </IconButton>
                )}
                {onRequestDelete && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      onRequestDelete(connection);
                    }}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                )}
                {onDisclose && (
                  <IconButton edge="end" onClick={() => onDisclose(connection)}>
                    <Icon>arrow_forward_ios</Icon>
                  </IconButton>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};
