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
// import { useDevice } from "hooks/use-device";

interface PageLayoutProps {
  children: React.ReactNode;
  title: React.ReactNode | string;
  subtitle?: React.ReactNode | string;
  tray?: React.ReactNode | string;
  disableMargins?: boolean;
  disablePadding?: boolean;
  stickyHeader?: boolean; // New prop for sticky header
  forceStickyHeader?: boolean; // forces stiky header behavior even in mobile
  bodyProps?: BoxProps;
  meta?: {
    title?: string;
  };
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  disablePadding,
  disableMargins,
  children,
  title,
  subtitle,
  tray,
  stickyHeader,
  forceStickyHeader,
  bodyProps = {},
  meta = {},
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // const { isDesktop } = useDevice();

  useEffect(() => {
    if (meta.title) {
      document.title = `${meta.title} - PGMate`;
    } else if (typeof title === "string") {
      document.title = `${title} - PGMate`;
    } else {
      document.title = "PGMate";
    }
  }, [title, meta.title]);

  return (
    <Paper
      elevation={isSmallScreen ? 0 : 3}
      sx={{
        // height: "100vh",
        ...(forceStickyHeader || (stickyHeader && !isSmallScreen)
          ? { height: "100vh" }
          : {}),
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
          ...(forceStickyHeader || (stickyHeader && !isSmallScreen)
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
          overflowY:
            forceStickyHeader || (stickyHeader && !isSmallScreen)
              ? "auto"
              : "visible", // Enable scrolling when header is sticky
          padding: disablePadding ? 0 : 2,
          // background: "green",
          // borderBottom: "5px solid fuchsia",
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};
