import React from "react";
import { Box, Tooltip, Typography, Stack } from "@mui/material";

interface UsageData {
  [model: string]: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface EstimateData {
  total: number;
  pretty: number;
  models: {
    [model: string]: {
      total: number;
      pretty: number;
    };
  };
}

interface DisplayUsageProps {
  usage: UsageData;
  estimate: EstimateData;
}

export const DisplayUsage: React.FC<DisplayUsageProps> = ({
  usage,
  estimate,
}) => {
  if (estimate.total === 0) return null;

  return (
    <Tooltip
      title={
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Usage Details</Typography>
          <Stack spacing={1}>
            {Object.entries(usage).map(([model, details]) => (
              <Box key={model}>
                <Typography variant="subtitle1">{model}</Typography>
                <Typography variant="body2">
                  Completion Tokens: {details.completion_tokens}
                </Typography>
                <Typography variant="body2">
                  Prompt Tokens: {details.prompt_tokens}
                </Typography>
                <Typography variant="body2">
                  Total Tokens: {details.total_tokens}
                </Typography>
                <Typography variant="body2">
                  Estimate: ${estimate.models[model].pretty} (
                  {estimate.models[model].total.toFixed(6)})
                </Typography>
              </Box>
            ))}
          </Stack>
          <Box mt={2}>
            <Typography variant="subtitle1">Total Estimate</Typography>
            <Typography variant="body2">
              ${estimate.pretty} ({estimate.total.toFixed(6)})
            </Typography>
          </Box>
        </Box>
      }
      arrow
    >
      <Typography
        variant="body1"
        sx={{
          background: "rgba(0, 0, 0, 0.1)",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {estimate.pretty < 0.01 ? "< $0.01" : `$ ${estimate.pretty}`}
      </Typography>
    </Tooltip>
  );
};
