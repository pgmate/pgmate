const schemaBaseColors = [
  "#67c2a6", // Teal
  "#ffd92e", // Yellow
  "#a5d952", // Lime
  "#e88bc4", // Pink
  "#8fa1cc", // Blue-grey
  "#f4a582", // Salmon
  "#b3e2cd", // Mint
  "#fed9a6", // Peach
  "#decbe4", // Lavender
  "#e6f5c9", // Light green
  "#cbd5e8", // Light blue
  "#fdcdac", // Light orange
  "#f4cae4", // Light pink
];

export const useColors = (items: any) => {
  const schemaColorMap = new Map<string, string>();
  let colorIndex = 0;

  const assignColors = (node: any, depth: number = 0) => {
    if (depth === 1) {
      // Assign colors to schemas
      if (!schemaColorMap.has(node.name)) {
        schemaColorMap.set(
          node.name,
          schemaBaseColors[colorIndex % schemaBaseColors.length]
        );
        colorIndex++;
      }
      node.color = schemaColorMap.get(node.name);
    }

    // Recurse only for children
    if (node.children) {
      node.children = node.children.map((child: any) =>
        assignColors(child, depth + 1)
      );
    }

    return node;
  };

  return assignColors(items);
};
