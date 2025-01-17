import React from "react";
import { IconButton, Icon } from "@mui/material";
import { useMUITheme } from "hooks/use-mui-theme";

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useMUITheme();
  const darkMode = theme === "dark";

  const switchTheme = () => setTheme(darkMode ? "light" : "dark");

  return (
    <IconButton
      aria-label="toggle light/dark theme"
      onClick={switchTheme}
      color="inherit"
    >
      {darkMode ? (
        <Icon children={"brightness_7"} />
      ) : (
        <Icon children={"brightness_4"} />
      )}
    </IconButton>
  );
};
