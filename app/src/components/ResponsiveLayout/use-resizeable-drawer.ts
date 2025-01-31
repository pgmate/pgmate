import { useState, useEffect } from "react";
import { useStorage } from "hooks/use-storage";

export const useResizeableDrawer = ({
  initialWidth = 0.15,
  minWidth = 200,
  maxWidth = 500,
}) => {
  const storage = useStorage();
  const [isResizing, setIsResizing] = useState(false);

  // Get the initial size from storage or calculate it based on the window size
  const [drawerWidth, setDrawerWidth] = useState(
    storage.getItem("responsiveLayout.drawer.width") ||
      Math.max(window.innerWidth * initialWidth, minWidth)
  );

  const startResizing = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  };

  const resizeDrawer = (event: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = Math.min(Math.max(event.clientX, minWidth), maxWidth);
    setDrawerWidth(newWidth);
    storage.setItem("responsiveLayout.drawer.width", newWidth);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resizeDrawer);
      window.addEventListener("mouseup", () => setIsResizing(false));
    }
    return () => {
      window.removeEventListener("mousemove", resizeDrawer);
      window.removeEventListener("mouseup", () => setIsResizing(false));
    };
  }, [isResizing]);

  return {
    width: drawerWidth,
    minWidth,
    maxWidth,
    startResizing,
  };
};
