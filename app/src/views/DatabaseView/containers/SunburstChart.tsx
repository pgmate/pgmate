import { useNavigate } from "react-router-dom";
import { useTreeMap } from "../hooks/use-tree-map";
import { SunburstChart as Chart } from "components/charts/SunburstChart";

interface SunburstChartProps {
  conn: Connection;
}

export const SunburstChart: React.FC<SunburstChartProps> = ({ conn }) => {
  const navigate = useNavigate();
  const { items } = useTreeMap(conn);

  if (items.children.length === 0) return null;

  return (
    <Chart
      title="Disk Usage"
      height={350}
      value={"total_size"}
      data={items}
      onClick={({ depth, path }: any) => {
        if (depth === 1) {
          navigate(`/${conn.name}/${conn.database}/${path[0]}`);
        } else if (depth === 2) {
          navigate(
            `/${conn.name}/${conn.database}/${path[1]}/${
              path[0].split(".")[1]
            }/info`
          );
        } else if (depth === 3) {
          console.log(path);
          navigate(
            `/${conn.name}/${conn.database}/${path[2]}/${
              path[0].split(".")[1]
            }/info`
          );
        }
      }}
    />
  );
};
