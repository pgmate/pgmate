import { Box, Paper, Typography } from "@mui/material";

interface PanelProps {
  primary?: string;
  secondary?: string;
  label?: string;
  variant?: "box" | "landscape";
  data: {
    metrics: {
      key: string;
      value: number;
      updated_at: string;
    }[];
  };
}

export const Panel: React.FC<PanelProps> = ({
  data,
  primary,
  secondary,
  label,
  variant = "box",
}) => {
  const primaryValue = primary ? (
    data ? (
      data.metrics.find((m) => m.key === primary)?.value || 0
    ) : (
      <Typography variant="caption">loading...</Typography>
    )
  ) : null;
  const secondaryValue = secondary
    ? data
      ? data.metrics.find((m) => m.key === secondary)?.value || 0
      : null
    : null;

  return (
    <Paper
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: {
          xs: variant === "box" ? "calc(50% - 8px)" : "100%", // Two panels per row on extra-small screens, full-width otherwise
          sm: "calc(50% - 8px)", // Two panels per row on small screens with gap accounted for
          md: variant === "box" ? 100 : 200, // Fixed width on medium and larger screens
        },
        height: variant === "box" ? 100 : 100,
      }}
    >
      <Typography variant="h2">
        {primaryValue}

        {secondaryValue && (
          <Typography variant="caption">/{secondaryValue}</Typography>
        )}
      </Typography>
      <Typography variant="caption" mt={0.5}>
        {label || primary}
      </Typography>
    </Paper>
  );
};

export const LineBreak = () => <Box sx={{ flexBasis: "100%", height: 0 }} />;
