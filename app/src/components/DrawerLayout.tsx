import {
  Box,
  Stack,
  Typography,
  Drawer,
  DrawerProps,
  Divider,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "./Icon";
import React from "react";

interface DrawerLayoutProps extends DrawerProps {
  disablePadding?: boolean;
  primaryTitle?: React.ReactNode;
  secondaryTitle?: React.ReactNode;
  withTitleDivider?: boolean;
}

export const DrawerLayout: React.FC<DrawerLayoutProps> = ({
  anchor,
  onClose,
  children,
  disablePadding,
  primaryTitle,
  secondaryTitle,
  withTitleDivider,
  ...props
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer
      {...props}
      onClose={onClose}
      anchor={anchor || isSmallScreen ? "bottom" : "right"}
      variant={isSmallScreen ? "temporary" : props.variant}
      ModalProps={{
        hideBackdrop: true, // No backdrop
      }}
      PaperProps={{
        sx: {
          pointerEvents: "auto", // Allow interaction with drawer content
        },
      }}
      sx={{
        pointerEvents: "none", // Allow clicks to pass through drawer container
        zIndex: isSmallScreen ? theme.zIndex.drawer + 2 : theme.zIndex.drawer,
        width: isSmallScreen ? "100vw" : "70vw",
        height: "100vh",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSmallScreen ? "100vw" : "70vw",
          height: "100vh",
        },
      }}
    >
      {!isSmallScreen && <Toolbar />}
      <Toolbar>
        <Box flex={1}>
          <Stack flex={1}>
            {primaryTitle && (
              <Typography variant="h4">{primaryTitle}</Typography>
            )}
            {secondaryTitle && (
              <Typography variant="h6">{secondaryTitle}</Typography>
            )}
          </Stack>
        </Box>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={(e) => onClose && onClose(e, "backdropClick")}
        >
          <Icon>close</Icon>
        </IconButton>
      </Toolbar>
      {withTitleDivider && <Divider />}
      <Box
        sx={{
          padding: disablePadding ? 0 : 2,
          paddingTop: 0,
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
};
