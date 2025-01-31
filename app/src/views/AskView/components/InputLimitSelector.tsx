import React, { useState } from "react";
import { Button, Menu, MenuItem, Stack, Icon, Tooltip } from "@mui/material";

interface InputLimitSelectorProps {
  limit: number; // The current selected limit
  setLimit: (value: number) => void; // Function to update the limit
}

export const InputLimitSelector: React.FC<InputLimitSelectorProps> = ({
  limit,
  setLimit,
}) => {
  // Linear values for input limit
  const options = [
    ...Array.from({ length: 6 }, (_, i) => (i + 1) * 10), // [10, 20, 30, 40, 50, 60]
    ...Array.from({ length: 7 }, (_, i) => 80 + i * 20), // [80, 100, 120]
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedLimit: number) => {
    setLimit(selectedLimit);
    setAnchorEl(null);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Display the selected limit */}
      <Tooltip title="Maximum number of history messages to pass to the model">
        <Button
          size="small"
          variant="outlined"
          onClick={handleClick}
          endIcon={<Icon>keyboard_arrow_down</Icon>}
        >
          {limit} msg
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
        {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === limit}
            onClick={() => handleSelect(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
