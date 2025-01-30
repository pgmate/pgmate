import { Box, Stack, Typography, useTheme } from "@mui/material";
import { formatLabelSize as formatSize } from "../SunburstChart/format-size";

export interface PieChartTooltipProps {
  id: string;
  value: number;
  color: string;
  label?: string; // Make `label` optional
}

export const PieChartTooltip = ({
  id,
  value,
  color,
  label,
}: PieChartTooltipProps) => {
  const theme = useTheme();

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
          {label || id}:
        </Typography>
        <Typography variant="body2" color="inherit">
          {formatSize(value)}
        </Typography>
      </Stack>
    </Box>
  );
};
