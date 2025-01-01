import { ResponsivePie, PieSvgProps } from "@nivo/pie";
import { Box, Typography, useTheme } from "@mui/material";

interface PieChartCustomProps {
  customTitle?: string; // Optional custom title
  legend?: "legend" | "labels" | "off"; // Toggle for legend, labels, or off
}

type PieChartProps<T> = Omit<PieSvgProps<T>, "data" | "height" | "width"> &
  PieChartCustomProps & {
    data: T[]; // Data is a required prop with the generic type
  };

type LegendProps = {
  anchor: "top" | "right" | "bottom" | "left";
  direction: "row" | "column";
  translateY: number;
  itemWidth: number;
  itemHeight: number;
  itemTextColor: string;
  symbolSize: number;
  symbolShape: "circle" | "square";
};

export const PieChart = <T extends { id: string | number; value: number }>(
  props: PieChartProps<T>
) => {
  const { customTitle, data, legend = "labels", ...chartProps } = props;

  // Access the current theme
  const theme = useTheme();

  // Define colors based on the theme
  const isDarkMode = theme.palette.mode === "dark";
  const textColor = theme.palette.text.primary;
  const legendTextColor = theme.palette.text.secondary;

  // Conditional settings for legends and labels
  const legends: LegendProps[] =
    legend === "legend"
      ? [
          {
            anchor: "left", // Position legend below the chart
            direction: "column",
            translateY: 0,
            itemWidth: 100,
            itemHeight: 25,
            itemTextColor: legendTextColor,
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]
      : [];

  // Enable arc link labels only in "labels" mode
  const arcLinkLabelsEnabled = legend === "labels";

  return (
    <Box height={400} width={"100%"}>
      {customTitle && (
        <Typography variant="h3" color={textColor} align="center" gutterBottom>
          {customTitle}
        </Typography>
      )}
      <ResponsivePie
        data={data}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        innerRadius={0.5} // Donut style
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: isDarkMode ? "dark2" : "set2" }} // Adjust color scheme
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={textColor}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={textColor}
        enableArcLinkLabels={arcLinkLabelsEnabled} // Enable/disable arc link labels
        legends={legends} // Conditional legends
        theme={{
          background: isDarkMode
            ? "transparent"
            : theme.palette.background.default, // Transparent in dark mode
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
        }}
        {...chartProps}
      />
    </Box>
  );
};
