import { useTreeMap } from "../hooks/use-tree-map";
import { SunburstChart as Chart } from "components/charts/SunburstChart";

interface SunburstChartProps {
  conn: Connection;
}

export const SunburstChart: React.FC<SunburstChartProps> = ({ conn }) => {
  const { items } = useTreeMap(conn);

  return (
    <Chart title="Disk Usage" height={400} value={"total_size"} data={items} />
  );
};
