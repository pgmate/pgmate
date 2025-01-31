import React, { useState } from "react";
import { Button, Menu, MenuItem, Stack, Icon, Tooltip } from "@mui/material";

interface ContextSelectorProps {
  context: "compact" | "full"; // The current selected context
  setContext: (context: "compact" | "full") => void; // Function to update the context
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context = "compact",
  setContext,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedContext: "compact" | "full") => {
    setContext(selectedContext);
    handleClose();
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Display the selected context with an arrow icon */}
      <Tooltip title="Level of schema information to pass to the model">
        <Button
          size="small"
          variant="outlined"
          onClick={handleClick}
          endIcon={<Icon>keyboard_arrow_down</Icon>}
        >
          {context}
        </Button>
      </Tooltip>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {["compact", "full"].map((option) => (
          <MenuItem
            key={option}
            selected={option === context}
            onClick={() => handleSelect(option as "compact" | "full")}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
