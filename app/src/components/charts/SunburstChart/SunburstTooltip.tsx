import { Box, Stack, Typography, useTheme } from "@mui/material";
import { formatTooltipSize as formatSize } from "./format-size";

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
  const theme = useTheme();

  // Dynamically set background and text colors based on the current theme mode
  const backgroundColor =
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.common.white;
  const borderColor =
    theme.palette.mode === "dark"
      ? theme.palette.grey[700]
      : theme.palette.grey[300];
  const textColor =
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.text.primary;

  return (
    <Box
      display="flex"
      alignItems="center"
      bgcolor={backgroundColor}
      color={textColor}
      padding="8px"
      border={`1px solid ${borderColor}`}
      borderRadius="4px"
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
      <Stack direction={"row"} spacing={1}>
        <Typography variant="body2" fontWeight="bold" color="inherit">
          {id}:
        </Typography>
        <Typography variant="body2" color="inherit">
          {formatSize(value)} ({percentage.toFixed(1)}%)
        </Typography>
      </Stack>
    </Box>
  );
};
