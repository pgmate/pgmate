import { useTheme as useMUITheme } from "@mui/material";

export const useTheme = () => {
  // Access the current theme
  const theme = useMUITheme();

  // Define colors based on the theme
  const isDarkMode = theme.palette.mode === "dark";

  return {
    isDarkMode,
    divider: isDarkMode ? "#444444" : "#fff",
  };
};
