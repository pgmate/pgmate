import { createContext, useState, ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useStorage } from "hooks/use-storage";
import { themeLight } from "./theme-light";
import { themeDark } from "./theme-dark";

type ThemeName = "light" | "dark";

export interface MUIContextProps {
  setTheme: (theme: ThemeName) => void;
  theme: ThemeName;
}

interface MuiProviderProps {
  children: ReactNode;
}

const themes = {
  light: themeLight,
  dark: themeDark,
};

const getSystemTheme = (): ThemeName => {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const MUIContext = createContext<MUIContextProps | undefined>(undefined);

export const MuiProvider: React.FC<MuiProviderProps> = ({ children }) => {
  const { getItem, setItem } = useStorage();
  const [theme, setValue] = useState(
    getItem<string>("theme", getSystemTheme()) as ThemeName
  );

  const setTheme = (theme: ThemeName) => {
    console.log("Setting theme:", theme);
    setItem<string>("theme", theme);
    setValue(theme);
  };

  return (
    <MUIContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MUIContext.Provider>
  );
};
