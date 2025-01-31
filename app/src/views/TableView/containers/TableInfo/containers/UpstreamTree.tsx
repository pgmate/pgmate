import { useNavigate } from "react-router-dom";
import { useTableMode } from "hooks/use-table-mode";
import { TreeChart } from "components/charts/TreeChart";
import { SizedBox } from "components/SizedBox";
import { Box, Typography } from "@mui/material";
import { useTableUpstream } from "../hooks/use-table-upstream";

const renderTooltip = (node: any) => {
  const { _isRoot, schema, name } = node.node.data;
  if (_isRoot) return null;
  return (
    <Typography variant="body2">
      {schema}.{name}
    </Typography>
  );
};

export const UpstreamTree = () => {
  const navigate = useNavigate();
  const table = useTableMode();
  const upstream = useTableUpstream();

  const handleClick = (node: any) => {
    if (node.data._isRoot) return;
    if (["view_table_dependency", "foreign_key"].includes(node.data.type)) {
      navigate(
        `/${table.conn}/${table.db}/${node.data.schema}/${node.data.name}/${table.mode}`
      );
    } else {
      console.log(node.data);
    }
  };

  if (!upstream.items.length) {
    return null;
  }

  return (
    <Box flex={1}>
      <SizedBox delay={50}>
        {({ width }) => (
          <TreeChart
            title="Upstream"
            width={width}
            height={200}
            chartProps={{
              mode: "tree",
              layout: "bottom-to-top",
              orientLabel: false,
              onNodeClick: handleClick,
            }}
            tooltip={renderTooltip}
            data={{
              _isRoot: true,
              name: upstream.table,
              children: upstream.tree,
            }}
          />
        )}
      </SizedBox>
    </Box>
  );
};
