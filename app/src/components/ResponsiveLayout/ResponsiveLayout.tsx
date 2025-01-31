import React, { useState } from "react";
import {
  AppBar,
  Box,
  Stack,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { Icon } from "components/Icon";
import { useDevice } from "hooks/use-device";
import { useResizeableDrawer } from "./use-resizeable-drawer";

interface LayoutProps {
  icon?: string | React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  menu: React.ReactNode;
  tray: React.ReactNode;
  children: React.ReactNode;
}

// Styled components for layout
const MainContent = styled("main")<{ marginLeft: number }>(
  ({ theme, marginLeft }) => ({
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 64px)",
    marginLeft: `${marginLeft}px`,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
    },
  })
);

// Styled resizable edge
const ResizeHandle = styled("div")(() => ({
  position: "absolute",
  top: 0,
  right: 0,
  width: `8px`,
  height: "100%",
  cursor: "ew-resize",
  backgroundColor: "transparent",
  zIndex: 1200, // Ensure it overlays content
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Light indication on hover
  },
}));

export const ResponsiveLayout: React.FC<LayoutProps> = ({
  children,
  menu,
  tray,
  icon,
  title,
  subtitle,
}) => {
  const { isDesktop } = useDevice();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawer = useResizeableDrawer({
    initialWidth: 0.2,
    minWidth: 200,
    maxWidth: 350,
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {icon && (
            <Box sx={{ mr: 2 }}>
              {typeof icon === "string" ? (
                <Icon sx={{ fontSize: 30 }}>{icon}</Icon>
              ) : (
                icon
              )}
            </Box>
          )}
          <Stack flex={1}>
            <Typography variant="h4">{title}</Typography>
            {subtitle && <Typography variant="h6">{subtitle}</Typography>}
          </Stack>
          {isDesktop && tray}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: "none" }, ml: 1 }}
          >
            <Icon>menu_icon</Icon>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />

      {/* Mobile Menu */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        anchor="right"
        onClose={handleDrawerToggle}
        onClick={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "80vw",
            minWidth: drawer.minWidth,
          },
        }}
      >
        <Toolbar />
        {mobileOpen && menu}
      </Drawer>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawer.width,
            minWidth: drawer.minWidth,
            maxWidth: drawer.maxWidth,
          },
        }}
        open
      >
        <Toolbar />
        {!mobileOpen && menu}

        <ResizeHandle onMouseDown={drawer.startResizing} />
      </Drawer>

      <MainContent marginLeft={drawer.width}>{children}</MainContent>
    </Box>
  );
};
