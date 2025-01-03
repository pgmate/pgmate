import {
  ResponsiveSunburst,
  SunburstSvgProps,
  ComputedDatum,
} from "@nivo/sunburst";
import { Box, Typography } from "@mui/material";
import { SunburstTooltip } from "./SunburstTooltip";
import { useTheme } from "./use-theme";
import { useColors } from "./use-colors";
import { formatLabelSize } from "./format-size";

interface SunburstNode {
  name: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

interface SunburstChartCustomProps {
  title?: string; // Optional custom title
  height?: number; // Height of the chart
  data: SunburstNode; // Data is a required prop
}

type SunburstChartProps = Partial<
  Omit<SunburstSvgProps<SunburstNode>, "data">
> &
  SunburstChartCustomProps;

export const SunburstChart = ({
  title,
  height,
  data,
  id = "name",
  value = "value",
  ...chartProps
}: SunburstChartProps) => {
  const theme = useTheme();

  const renderTooltip = (datum: ComputedDatum<SunburstNode>) => {
    const { id, value, color, percentage } = datum;
    return (
      <SunburstTooltip
        id={String(id)} // Ensure id is a string
        value={value || 0} // Default to 0 if value is undefined
        percentage={percentage}
        color={color}
      />
    );
  };

  return (
    <Box display={"block"} height={height} width={"100%"}>
      {title && (
        <Typography variant="h3" align="center" mt={2} gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveSunburst
        data={useColors(data)}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id={id}
        value={value}
        cornerRadius={3}
        borderWidth={1}
        borderColor={theme.divider}
        colors={(node: any) => node.data.color}
        childColor={{
          from: "color",
          modifiers: [["brighter", 0.1]],
        }}
        enableArcLabels={true}
        arcLabel={(node) => formatLabelSize(node.value)} // Correct property for arc label
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#000000"
        motionConfig="gentle"
        transitionMode="pushIn"
        tooltip={renderTooltip} // Use the adapted tooltip function
        {...chartProps}
      />
    </Box>
  );
};
