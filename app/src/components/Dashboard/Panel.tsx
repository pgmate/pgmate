import { Box, Paper, Typography } from "@mui/material";

export interface PanelProps {
  primary?: string | number | React.ReactNode;
  secondary?: string | number | React.ReactNode;
  label?: string | React.ReactNode;
  variant?: "box" | "landscape";
}

export const Panel: React.FC<PanelProps> = ({
  primary,
  secondary,
  label,
  variant = "box",
}) => {
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
        {primary}

        {secondary && <Typography variant="caption">/{secondary}</Typography>}
      </Typography>
      <Typography variant="caption" mt={0.5}>
        {label || primary}
      </Typography>
    </Paper>
  );
};

export const LineBreak = () => <Box sx={{ flexBasis: "100%", height: 0 }} />;
