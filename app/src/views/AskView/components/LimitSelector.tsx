import React from "react";
import { Slider, Box, Tooltip } from "@mui/material";

interface LimitSelectorProps {
  limit: number; // The current selected limit
  setLimit: (value: number) => void; // Function to update the limit
}

export const LimitSelector: React.FC<LimitSelectorProps> = ({
  limit,
  setLimit,
}) => {
  // Non-linear token values
  const marks = [100, 500, 1000, 2000, 3000, 10000, 50000];

  // Convert token value to slider position
  const valueToIndex = (value: number) => marks.indexOf(value);

  // Convert slider position to token value
  const indexToValue = (index: number) => marks[index] || 100;

  return (
    <Tooltip
      title={`Max Tokens: ${limit >= 1000 ? `${limit / 1000}k` : limit}`}
      arrow
    >
      <Box sx={{ width: 100 }}>
        <Slider
          value={valueToIndex(limit)}
          onChange={(_, newValue) => {
            const newLimit = indexToValue(newValue as number);
            setLimit(newLimit);
          }}
          step={1}
          min={0}
          max={marks.length - 1}
          valueLabelDisplay="off" // Hide value labels
          sx={{
            "& .MuiSlider-thumb": {
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0px 0px 0px 8px rgba(0,0,0,0.16)",
              },
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};
