import { Box } from "@mui/material";
import { Panel, PanelProps } from "./Panel";

type DashboardItem = PanelProps;

interface DashboardProps {
  panels: DashboardItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ panels }) => {
  // console.log("*****", panels);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {panels.map((panel, index) => (
        <Panel key={index} {...panel} />
      ))}
    </Box>
  );
};
