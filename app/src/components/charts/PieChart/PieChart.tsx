import { ResponsivePie, PieSvgProps } from "@nivo/pie";
import { Box, Typography } from "@mui/material";
import { useTheme } from "./use-theme";
import { PieChartTooltip } from "./PieChartTooltip";

interface PieChartCustomProps {
  customTitle?: string; // Optional custom title
  legend?: "legend" | "labels" | "off"; // Toggle for legend, labels, or off
  height?: number; // Height of the chart
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
  const {
    customTitle,
    data,
    legend = "labels",
    height = 400,
    ...chartProps
  } = props;
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

  const renderTooltip = ({ datum }: any) => {
    const { id, value, color } = datum;
    return (
      <PieChartTooltip
        id={String(id)} // Ensure id is a string
        value={value || 0} // Default to 0 if value is undefined
        color={color}
      />
    );
  };

  return (
    <Box display={"block"} height={height} width={"100%"}>
      {customTitle && (
        <Typography variant="h3" align="center" mt={2} gutterBottom>
          {customTitle}
        </Typography>
      )}
      <ResponsivePie
        data={data}
        margin={{ top: 30, right: 20, bottom: 50, left: 20 }}
        innerRadius={0.75} // Donut style
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
        tooltip={renderTooltip} // Custom tooltip
        {...chartProps}
      />
    </Box>
  );
};
