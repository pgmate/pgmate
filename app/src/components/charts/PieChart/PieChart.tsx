import { ResponsivePie, PieSvgProps } from "@nivo/pie";
import { Box, Typography } from "@mui/material";
import { useTheme } from "./use-theme";

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
  const theme = useTheme();

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
            itemTextColor: theme.colors.legend.text,
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
        <Typography variant="h3" align="center" gutterBottom>
          {customTitle}
        </Typography>
      )}
      <ResponsivePie
        data={data}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        innerRadius={0.5} // Donut style
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: theme.isDarkMode ? "dark2" : "set2" }} // Adjust color scheme
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme.colors.text}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={theme.colors.text}
        enableArcLinkLabels={arcLinkLabelsEnabled} // Enable/disable arc link labels
        legends={legends} // Conditional legends
        theme={theme.theme} // Use custom theme
        {...chartProps}
      />
    </Box>
  );
};
