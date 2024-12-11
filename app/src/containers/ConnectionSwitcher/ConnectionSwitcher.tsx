import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  ListItemText,
  Button,
} from "@mui/material";

import { useConnections, useURLConnection } from "../../hooks/use-connections";
import { usePubSub } from "../../hooks/use-pubsub";

export const ConnectionSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const bus = usePubSub();
  const { items: connections } = useConnections();
  const currentConnection = useURLConnection();

  const [open, setOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string>) => {
    navigate(`/${event.target.value}`);
    setOpen(false);
  };

  const handleManageConnections = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    bus.emit("connections::manager");
    setOpen(false);
  };

  return (
    <FormControl fullWidth>
      <Select
        value={currentConnection?.name || ""}
        onChange={handleChange}
        size="small"
        displayEmpty
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderValue={(selected) =>
          selected ? `Connected to: ${selected}` : "Select a connection"
        }
        sx={{
          color: "inherit", // Text color inherits from parent
          "& .MuiSvgIcon-root": {
            color: "inherit", // Icon color
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) =>
              theme.palette.mode === "light" ? "white" : "inherit",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) =>
              theme.palette.mode === "light" ? "white" : "inherit", // Border color inherits
          },
        }}
      >
        {/* Connection items */}
        {connections.map((connection) => (
          <MenuItem key={connection.name} value={connection.name}>
            <ListItemText
              primary={connection.name}
              secondary={connection.desc}
              sx={{ py: 0 }}
            />
          </MenuItem>
        ))}

        {/* Manage Connections Button */}
        <MenuItem
          key="manage-connections"
          value="manage-connections"
          sx={{ display: "flex", justifyContent: "center", pt: 1 }}
          onClick={(e) => e.stopPropagation()} // Prevent selection change
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleManageConnections}
          >
            Manage Connections
          </Button>
        </MenuItem>
      </Select>
    </FormControl>
  );
};
