import { useNavigate } from "react-router-dom";
import { Paper } from "@mui/material";
import { useTableSize } from "../hooks/use-table-size";
import { PieChart } from "components/charts/PieChart";
import { PieTooltipProps } from "@nivo/pie";

interface DiskChartsProps {
  conn: Connection;
  details?: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)}${sizes[i]}`;
};

// const ArcLabel = ({ value }: { value: number }) => formatBytes(value);

const ArcTooltip = ({
  datum,
}: PieTooltipProps<{ id: string; label: string; value: number }>) => (
  <Paper
    sx={{
      fontSize: 12,
      px: 2,
      py: 1,
    }}
  >
    <b>{datum.id}:</b> {formatBytes(datum.value)}
  </Paper>
);

export const DiskCharts: React.FC<DiskChartsProps> = ({
  conn,
  details = 5,
}) => {
  const navigate = useNavigate();
  const { items } = useTableSize(conn);

  // Process data: Keep top 5 items, group the rest into "others"
  const processedData = (() => {
    // Sort items by total_size descending
    const sortedItems = [...items].sort((a, b) => b.total_size - a.total_size);

    // Take the first 5 items
    const topFive = sortedItems.slice(0, details).map((item) => ({
      id: `${item.schema}.${item.table_name}`,
      label: `${item.schema}.${item.table_name}`,
      value: item.total_size,
    }));

    // Sum the rest into "others"
    const othersValue = sortedItems
      .slice(details)
      .reduce((acc, item) => acc + item.total_size, 0);
    if (othersValue > 0) {
      topFive.push({ id: "others", label: "others", value: othersValue });
    }

    return topFive;
  })();

  return (
    <PieChart
      customTitle="Top Tables by Size"
      data={processedData}
      height={250}
      arcLabel={() => ""}
      tooltip={ArcTooltip}
      onClick={(data) => {
        if (data.id === "others") return;
        navigate(
          `/${conn.name}/${conn.database}/${String(data.label)
            .split(".")
            .join("/")}/data`
        );
      }}
    />
  );
};
