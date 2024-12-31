import React from "react";
import { Box, Icon, Tooltip, Typography } from "@mui/material";

interface HealthRateProps {
  health_factor: number; // Health factor value (e.g., 0.95)
  health_rate: "green" | "yellow" | "red"; // Health indicator (color-coded)
  committed_ts: number; // Total committed transactions
  rolled_back_ts: number; // Total rolled-back transactions
}

export const HealthRate: React.FC<HealthRateProps> = ({
  health_factor,
  health_rate,
  committed_ts,
  rolled_back_ts,
}) => {
  // Get the appropriate color for the health_rate
  const getHealthColor = (rate: "green" | "yellow" | "red") => {
    switch (rate) {
      case "green":
        return "green";
      case "yellow":
        return "orange";
      case "red":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2">
            <strong>Health Factor:</strong> {health_factor.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            <strong>Commits:</strong> {committed_ts}
          </Typography>
          <Typography variant="body2">
            <strong>Rollbacks:</strong> {rolled_back_ts}
          </Typography>
        </Box>
      }
      arrow
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: getHealthColor(health_rate),
          display: "inline-block",
          cursor: "help",
        }}
      >
        {/* Optionally, add an Icon inside the circle */}
        <Icon
          sx={{
            fontSize: 18,
            color: "white",
            lineHeight: "24px",
            textAlign: "center",
            width: "100%",
            height: "100%",
          }}
        >
          info
        </Icon>
      </Box>
    </Tooltip>
  );
};
