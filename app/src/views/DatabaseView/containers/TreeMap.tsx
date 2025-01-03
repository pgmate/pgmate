// import { useNavigate } from "react-router-dom";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { useTreeMap } from "../hooks/use-tree-map";

interface TreeMapProps {
  conn: Connection;
}

export const TreeMap: React.FC<TreeMapProps> = ({ conn }) => {
  // const navigate = useNavigate();
  const { items } = useTreeMap(conn);

  console.log("@tree-map", items);

  return (
    <>
      <div style={{ height: 500, width: 500 }}>
        <ResponsiveTreeMap
          data={items}
          identity="name"
          value="value"
          innerPadding={3}
          outerPadding={3}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.2]],
          }}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.3]],
          }}
          onClick={(node) => {
            console.log("Clicked node:", node);
          }}
        />
      </div>
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </>
  );
};
