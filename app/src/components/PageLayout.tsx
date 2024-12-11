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

interface PageLayoutProps {
  title: React.ReactNode | string;
  children: React.ReactNode;
  subtitle?: React.ReactNode | string;
  tray?: React.ReactNode | string;
  disablePadding?: boolean;
  bodyProps?: BoxProps;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  disablePadding,
  children,
  title,
  subtitle,
  tray,
  bodyProps = {},
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        marginX: isSmallScreen ? 0 : 2,
        marginY: isSmallScreen ? 0 : 2,
        borderRadius: 0,
      }}
    >
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{
          padding: 2,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
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
      <Box
        {...bodyProps}
        sx={{ ...bodyProps.sx, padding: disablePadding ? 0 : 2 }}
      >
        {children}
      </Box>
    </Paper>
  );
};
