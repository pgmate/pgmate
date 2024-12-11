import React, { useState, useEffect } from "react";
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
import { Icon } from "./Icon";

interface LayoutProps {
  icon?: string | React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  menu: React.ReactNode;
  tray: React.ReactNode;
  children: React.ReactNode;
}

const drawerWidth = 0.15;
const drawerMinWidth = 200;

// Styled components for layout
const MainContent = styled("main")<{ marginLeft: number }>(
  ({ theme, marginLeft }) => ({
    flexGrow: 1,
    marginLeft: `${marginLeft}px`,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
    },
  })
);

export const ResponsiveLayout: React.FC<LayoutProps> = ({
  children,
  menu,
  tray,
  icon,
  title,
  subtitle,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState(
    Math.max(window.innerWidth * drawerWidth, drawerMinWidth)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Handler to update marginLeft when the viewport is resized
    const handleResize = () => {
      setMarginLeft(Math.max(window.innerWidth * drawerWidth, drawerMinWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          {tray}
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
            width: drawerWidth,
            minWidth: drawerMinWidth,
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
            width: drawerWidth,
            minWidth: drawerMinWidth,
          },
        }}
        open
      >
        <Toolbar />
        {!mobileOpen && menu}
      </Drawer>

      <MainContent marginLeft={marginLeft}>{children}</MainContent>
    </Box>
  );
};
