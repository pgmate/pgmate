import { useTheme as useMUITheme } from "@mui/material";

export const useTheme = () => {
  // Access the current theme
  const theme = useMUITheme();

  // Define colors based on the theme
  const isDarkMode = theme.palette.mode === "dark";
  const textColor = theme.palette.text.primary;
  const legendTextColor = theme.palette.text.secondary;

  return {
    isDarkMode,
    theme: {
      background: isDarkMode ? "transparent" : theme.palette.background.default, // Transparent in dark mode
      text: {
        fontSize: 12,
        fill: textColor,
      },
      axis: {
        domain: {
          line: {
            stroke: textColor,
            strokeWidth: 1,
          },
        },
        ticks: {
          line: {
            stroke: textColor,
            strokeWidth: 1,
          },
          text: {
            fill: textColor,
          },
        },
      },
      grid: {
        line: {
          stroke: isDarkMode ? "#444444" : "#cccccc", // Adjust based on theme
          strokeWidth: 1,
        },
      },
      legends: {
        text: {
          fill: legendTextColor,
        },
      },
      tooltip: {
        container: {
          background: isDarkMode ? "#444444" : "#ffffff", // Adjust based on theme
          color: textColor,
          fontSize: 12,
          borderRadius: 4,
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.5)", // Subtle shadow for depth
          padding: "5px 10px",
        },
      },
    },
    colors: {
      text: textColor,
      legend: {
        text: legendTextColor,
      },
    },
  };
};
