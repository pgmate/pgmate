import { ResponsiveSunburst } from "@nivo/sunburst";
import { Box } from "@mui/material";
import { useTreeMap } from "../hooks/use-tree-map";

interface SunburstChartProps {
  conn: Connection;
}

export const SunburstChart: React.FC<SunburstChartProps> = ({ conn }) => {
  const { items } = useTreeMap(conn);
  console.log("@sunburst", items);

  return (
    <Box height={600} width={"100%"}>
      <ResponsiveSunburst
        data={items}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id="name"
        value="total_size"
        cornerRadius={2}
        borderColor={{ theme: "background" }}
        colors={{ scheme: "nivo" }}
        childColor={{
          from: "color",
          modifiers: [["brighter", 0.1]],
        }}
        enableArcLabels={true}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 1.4]],
        }}
      />
    </Box>
  );
};
