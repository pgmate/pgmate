import { useNavigate } from "react-router-dom";
import { useTableSize } from "../hooks/use-table-size";
import { PieChart } from "components/charts/PieChart";

interface DiskChartsProps {
  conn: Connection;
  details?: number;
}

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
      height={350}
      arcLabel={() => ""}
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
