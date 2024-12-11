import { useTheme, Paper as MUIPaper, PaperProps } from "@mui/material";

export const Paper: React.FC<PaperProps> = ({ sx, ...props }) => {
  const theme = useTheme();

  return (
    <MUIPaper
      {...props}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...sx,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    />
  );
};
