import { ResponsiveNetwork } from "@nivo/network";
import { Box } from "@mui/material";
import { useTableUpstream } from "../hooks/use-table-upstream";
import { useTableDownstream } from "../hooks/use-table-downstream";

export const DependenciesGraph = () => {
  const upstream = useTableUpstream();
  const downstream = useTableDownstream();

  console.log("UPSTREAM", upstream);

  const _data = {
    nodes: [
      {
        id: `${upstream.schema}.${upstream.table}`,
        height: 1,
        size: 20,
        color: "rgb(15, 191, 41)",
      },
      ...upstream.items.map((item) => ({
        id: `${item.schema}.${item.name}`,
        height: 1,
        size: 15,
        color: "rgb(225, 21, 21)",
      })),
      ...downstream.items.map((item) => ({
        id: `${item.schema}.${item.name}`,
        height: 1,
        size: 15,
        color: "rgb(16, 124, 218)",
      })),
    ],
    links: [
      ...upstream.items.map((item) => ({
        target: `${upstream.schema}.${upstream.table}`,
        source: `${item.schema}.${item.name}`,
        distance: 70,
      })),
      ...downstream.items.map((item) => ({
        target: `${item.schema}.${item.name}`,
        source: `${downstream.schema}.${downstream.table}`,
        distance: 100,
      })),
    ],
  };

  console.log("DATA:", _data);

  return (
    <Box
      sx={{
        width: "100%",
        height: 250,
        border: "1px solid black",
      }}
    >
      <ResponsiveNetwork
        data={_data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        linkDistance={(e) => e.distance}
        // centeringStrength={1.5}
        // repulsivity={5}
        nodeSize={(n) => n.size}
        activeNodeSize={(n) => 1.5 * n.size}
        nodeColor={(e) => e.color}
        nodeBorderWidth={1}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        linkThickness={(n) => 1 + 1 * n.target.data.height}
        linkBlendMode="multiply"
        motionConfig="wobbly"
        layers={["links", "nodes", "annotations"]}
        annotations={[
          {
            type: "circle",
            match: { id: `${upstream.schema}.${upstream.table}` },
            note: `${upstream.schema}.${upstream.table}`,
            noteX: 150,
            noteY: -50,
          },
          // ...upstream.items.map((item) => ({
          //   type: "circle",
          //   match: { id: `${item.schema}.${item.name}` },
          //   note: `${item.schema}.${item.name}`,
          //   noteX: -100,
          //   noteY: 0,
          // })),
          // ...downstream.items.map((item) => ({
          //   type: "circle",
          //   match: { id: `${item.schema}.${item.name}` },
          //   note: `${item.schema}.${item.name}`,
          //   noteX: 100,
          //   noteY: 0,
          // })),
        ]}
      />
    </Box>
  );
};
