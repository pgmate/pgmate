import { ResponsivePie, PieSvgProps } from "@nivo/pie";
import { Box, Typography } from "@mui/material";

interface PieChartCustomProps {
  customTitle?: string; // Optional custom title
}

type PieChartProps<T> = Omit<PieSvgProps<T>, "data" | "height" | "width"> &
  PieChartCustomProps & {
    data: T[]; // Data is a required prop with the generic type
  };

export const PieChart = <T extends { id: string | number; value: number }>(
  props: PieChartProps<T>
) => {
  console.log("@PieChartProps", props);
  const { customTitle, data, ...chartProps } = props;

  return (
    <Box height={400} width={"100%"}>
      {customTitle && <Typography variant="h3">{customTitle}</Typography>}
      <ResponsivePie
        data={data}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        innerRadius={0.5} // Donut style
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: "dark2" }} // Use a dark color scheme
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#ffffff" // White labels for better contrast
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        theme={{
          background: "#333333", // Dark background
          text: {
            fontSize: 12,
            fill: "#ffffff", // White text
          },
          axis: {
            domain: {
              line: {
                stroke: "#777777", // Darker axis line
                strokeWidth: 1,
              },
            },
            ticks: {
              line: {
                stroke: "#777777", // Darker tick lines
                strokeWidth: 1,
              },
              text: {
                fill: "#ffffff", // White tick labels
              },
            },
          },
          grid: {
            line: {
              stroke: "#444444", // Darker grid lines
              strokeWidth: 1,
            },
          },
          legends: {
            text: {
              fill: "#ffffff", // White legend text
            },
          },
          tooltip: {
            container: {
              background: "#444444", // Dark tooltip background
              color: "#ffffff", // White tooltip text
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
