import { styled } from "@mui/material/styles";
import { Icon as MUIIcon } from "@mui/material";

export const Icon = styled(MUIIcon, {
  shouldForwardProp: (prop) => prop !== "rotate" && prop !== "deg",
})<{ rotate?: boolean; deg?: number; fontSize?: number | string }>(
  ({ theme, rotate = false, deg = 180, fontSize = "medium" }) => ({
    fontSize: fontSize || "inherit", // Allow fontSize to be customized or inherit
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
    transform: rotate ? `rotate(${deg}deg)` : "rotate(0deg)",
  })
);
