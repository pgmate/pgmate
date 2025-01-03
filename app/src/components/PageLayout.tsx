import { useEffect } from "react";
import {
  Paper,
  Box,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  BoxProps,
} from "@mui/material";
import { useDevice } from "hooks/use-device";

interface PageLayoutProps {
  title: React.ReactNode | string;
  children: React.ReactNode;
  subtitle?: React.ReactNode | string;
  tray?: React.ReactNode | string;
  disableMargins?: boolean;
  disablePadding?: boolean;
  stickyHeader?: boolean; // New prop for sticky header
  bodyProps?: BoxProps;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  disablePadding,
  disableMargins,
  children,
  title,
  subtitle,
  tray,
  stickyHeader,
  bodyProps = {},
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { isDesktop } = useDevice();

  useEffect(() => {
    if (typeof title === "string") {
      document.title = `${title} - CYBER`;
    } else {
      document.title = "CYBER";
    }
  }, [title]);

  return (
    <Paper
      elevation={isSmallScreen ? 0 : 3}
      sx={{
        // height: "100vh",
        ...(stickyHeader && isDesktop ? { height: "100vh" } : {}),
        display: "flex",
        flexDirection: "column",
        marginX: isSmallScreen || disableMargins ? 0 : 2,
        marginY: isSmallScreen || disableMargins ? 0 : 2,
        borderRadius: 0,
      }}
    >
      {/* Page Header */}
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{
          padding: 2,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          ...(stickyHeader && isDesktop
            ? {
                position: "sticky",
                top: 0,
                zIndex: theme.zIndex.appBar,
                // backgroundColor: theme.palette.background.paper,
              }
            : {}),
        }}
      >
        <Stack>
          {typeof title === "string" ? (
            <Typography variant="h4">{title}</Typography>
          ) : (
            title
          )}
          {subtitle &&
            (typeof subtitle === "string" ? (
              <Typography variant="body1">{subtitle}</Typography>
            ) : (
              subtitle
            ))}
        </Stack>
        {tray}
      </Stack>
      {/* Page Body */}
      <Box
        {...bodyProps}
        sx={{
          ...bodyProps.sx,
          flex: 1,
          overflowY: stickyHeader && isDesktop ? "auto" : "visible", // Enable scrolling when header is sticky
          padding: disablePadding ? 0 : 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};
