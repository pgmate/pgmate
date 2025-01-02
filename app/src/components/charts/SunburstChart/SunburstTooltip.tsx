import { Box, Typography } from "@mui/material";
import { formatLabelSize as formatSize } from "./format-size";

export interface SunburstTooltipProps {
  id: string;
  value: number;
  percentage: number;
  color: string;
}

export const SunburstTooltip = ({
  id,
  value,
  percentage,
  color,
}: SunburstTooltipProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      bgcolor="white"
      padding="8px"
      border="1px solid #ccc"
      borderRadius="4px"
      boxShadow="0px 2px 4px rgba(0, 0, 0, 0.2)"
    >
      {/* Color Indicator */}
      <Box
        width="12px"
        height="12px"
        bgcolor={color}
        marginRight="8px"
        borderRadius="50%"
      />
      {/* Text Content */}
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {id}
        </Typography>
        <Typography variant="body2">
          {formatSize(value)} ({percentage.toFixed(1)}%)
        </Typography>
      </Box>
    </Box>
  );
};
