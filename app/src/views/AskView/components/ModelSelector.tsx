import React, { useState } from "react";
import { Button, Menu, MenuItem, Stack, Icon } from "@mui/material";
import type { LLMModel } from "../ask.d";

interface ModelSelectorProps {
  model: LLMModel; // The current selected model
  setModel: (model: LLMModel) => void; // Function to update the model
  options: LLMModel[]; // Available options for selection
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
  options,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedModel: LLMModel) => {
    setModel(selectedModel);
    handleClose();
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Display the selected model with an arrow icon */}
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<Icon>keyboard_arrow_down</Icon>}
      >
        {model}
      </Button>

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
            selected={option === model}
            onClick={() => handleSelect(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};
