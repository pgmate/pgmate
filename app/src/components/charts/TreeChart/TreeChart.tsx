import { ResponsiveTree } from "@nivo/tree";
import { Box, Typography, useTheme } from "@mui/material";
import React from "react";

interface TreeChartProps {
  title?: string;
  width?: number;
  height?: number;
  data: any;
  chartProps?: any;
  margins?: Record<string, number>;
  tooltip?: (node: any) => React.ReactNode;
}

export const TreeChart: React.FC<TreeChartProps> = ({
  title,
  width = 400,
  height = 400,
  data,
  chartProps = {},
  margins = {},
  tooltip,
}) => {
  const theme = useTheme();

  const renderTooltip =
    (tooltip: (node: any) => React.ReactNode) => (node: any) => {
      const theme = useTheme();
      const content = tooltip(node);

      const backgroundColor =
        theme.palette.mode === "dark"
          ? theme.palette.grey[900]
          : theme.palette.common.white;
      const borderColor =
        theme.palette.mode === "dark"
          ? theme.palette.grey[700]
          : theme.palette.grey[300];
      const textColor =
        theme.palette.mode === "dark"
          ? theme.palette.common.white
          : theme.palette.text.primary;

      if (!content) return null;
      return (
        <Box
          sx={{
            backgroundColor: backgroundColor,
            color: textColor,
            borderRadius: 1,
            border: "1px solid",
            borderColor,
            boxShadow: theme.shadows[1],
            paddingX: 2,
            paddingY: 1,
          }}
        >
          {content}
        </Box>
      );
    };

  // console.log("TreeChart", title, width);
  return (
    <Box sx={{ width, height }}>
      {title && (
        <Typography
          variant="h4"
          align="center"
          mt={2}
          gutterBottom
          sx={{ marginBottom: 0 }}
        >
          {title}
        </Typography>
      )}
      <ResponsiveTree
        data={data}
        identity="name"
        activeNodeSize={30}
        inactiveNodeSize={10}
        nodeColor={{ scheme: "tableau10" }}
        fixNodeColorAtDepth={1}
        linkThickness={2}
        activeLinkThickness={6}
        inactiveLinkThickness={2}
        linkColor={{
          from: "target.color",
          modifiers: [["opacity", 0.4]],
        }}
        margin={{
          top: height * 0.2,
          bottom: height * 0.4,
          right: width * 0.1,
          left: width * 0.1,
          ...margins,
        }}
        motionConfig="stiff"
        meshDetectionRadius={80}
        theme={{
          text: {
            fill: theme.palette.text.primary,
          },
        }}
        nodeTooltip={tooltip ? renderTooltip(tooltip) : undefined}
        {...chartProps}
      />
    </Box>
  );
};
