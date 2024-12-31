import { useNavigate } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie";
import { Card, CardContent } from "@mui/material";
import { useTableSize } from "../hooks/use-table-size";

interface DiskChartsProps {
  conn: Connection;
}

export const DiskCharts: React.FC<DiskChartsProps> = ({ conn }) => {
  const navigate = useNavigate();
  const { items } = useTableSize(conn);

  // Process data: Keep top 5 items, group the rest into "others"
  const processedData = (() => {
    // Sort items by total_size descending
    const sortedItems = [...items].sort((a, b) => b.total_size - a.total_size);

    // Take the first 5 items
    const topFive = sortedItems.slice(0, 5).map((item) => ({
      id: `${item.schema}.${item.table_name}`,
      label: `${item.schema}.${item.table_name}`,
      value: item.total_size,
    }));

    // Sum the rest into "others"
    const othersValue = sortedItems
      .slice(5)
      .reduce((acc, item) => acc + item.total_size, 0);
    if (othersValue > 0) {
      topFive.push({ id: "others", label: "others", value: othersValue });
    }

    return topFive;
  })();

  console.log(processedData);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <ResponsivePie
        data={processedData}
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
        onClick={(data) => {
          if (data.id === "others") return;
          navigate(
            `/${conn.name}/${conn.database}/${String(data.label)
              .split(".")
              .join("/")}/data`
          );
        }}
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
      />
    </div>
  );
};
