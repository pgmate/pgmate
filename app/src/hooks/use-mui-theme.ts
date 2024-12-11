import { useContext } from "react";

import { MUIContext, MUIContextProps } from "../providers/MuiProvider";

export const useMUITheme = (): MUIContextProps => {
  const context = useContext(MUIContext);
  if (!context) {
    throw new Error("useTheme must be used within a MuiProvider");
  }
  return context;
};
