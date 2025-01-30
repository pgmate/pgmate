import { useNavigate } from "react-router-dom";
import { useTableMode } from "hooks/use-table-mode";
import { TreeChart } from "components/charts/TreeChart";
import { SizedBox } from "components/SizedBox";
import { Typography, Box } from "@mui/material";
import { useTableDownstream } from "../hooks/use-table-downstream";

const renderTooltip = (node: any) => {
  const { _isRoot, schema, name } = node.node.data;

  if (_isRoot) return null;

  return (
    <Typography variant="body2">
      {schema}.{name}
    </Typography>
  );
};

export const DownstreamTree = () => {
  const navigate = useNavigate();
  const conn = useTableMode();

  const { items, tree, table } = useTableDownstream();

  const handleClick = (node: any) => {
    if (node.data._isRoot) return;
    if (["r", "m", "v"].includes(node.data.type)) {
      navigate(
        `/${conn.conn}/${conn.db}/${node.data.schema}/${node.data.name}/${conn.mode}`
      );
    } else {
      console.log(node.data);
    }
  };

  if (!items.length) return null;

  return (
    <Box flex={1}>
      <SizedBox delay={50}>
        {({ width }) => (
          <TreeChart
            title="Downstream"
            width={width}
            height={200}
            chartProps={{
              mode: "tree",
              layout: "top-to-bottom",
              orientLabel: false,
              onNodeClick: handleClick,
            }}
            tooltip={renderTooltip}
            data={{
              _isRoot: true,
              name: table,
              children: tree,
            }}
          />
        )}
      </SizedBox>
    </Box>
  );
};
