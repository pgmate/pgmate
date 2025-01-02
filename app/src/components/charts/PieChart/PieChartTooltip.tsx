import { Box, Typography } from "@mui/material";
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
      <Box
        width="12px"
        height="12px"
        bgcolor={color}
        marginRight="8px"
        borderRadius="50%"
      />
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {label || id}
        </Typography>
        <Typography variant="body2">{formatSize(value)}</Typography>
      </Box>
    </Box>
  );
};
