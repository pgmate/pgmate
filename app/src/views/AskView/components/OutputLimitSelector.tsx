import React, { useState } from "react";
import { Button, Menu, MenuItem, Stack, Icon, Tooltip } from "@mui/material";

interface OutputLimitSelectorProps {
  limit: number; // The current selected limit
  setLimit: (value: number) => void; // Function to update the limit
}

export const OutputLimitSelector: React.FC<OutputLimitSelectorProps> = ({
  limit,
  setLimit,
}) => {
  // Non-linear token values
  const options = [100, 500, 1000, 2000, 3000, 10000, 50000];

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
      <Tooltip title="Maximum number of tokens to generate">
        <Button
          size="small"
          variant="outlined"
          onClick={handleClick}
          endIcon={<Icon>keyboard_arrow_down</Icon>}
        >
          {limit >= 1000 ? `${limit / 1000}k` : limit} tokens
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
            {option >= 1000 ? `${option / 1000}k` : option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
