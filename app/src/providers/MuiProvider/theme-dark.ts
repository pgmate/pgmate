import type {} from "@mui/x-data-grid/themeAugmentation";
import { createTheme } from "@mui/material/styles";
import { typography } from "./typography";

export const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography,
});
