import { useMediaQuery, useTheme } from "@mui/material";
import { isFullScreen } from "hooks/is-fullscreen";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface Device {
  isTouch: boolean;
  isMobile: boolean;
  isFullScreen: boolean;
}

export const useDevice = (): Device => {
  const theme = useTheme();

  return {
    isTouch: useMediaQuery("(hover: none) and (pointer: coarse)"),
    isMobile: useMediaQuery(theme.breakpoints.down("sm")),
    isFullScreen: isFullScreen(),
  };
};
