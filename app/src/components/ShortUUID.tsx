import {
  Stack,
  Typography,
  Tooltip,
  TooltipProps,
  TypographyProps,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Icon } from "components/Icon";

interface ShortUUIDProps {
  uuid: string;
  length?: number;
  title?: React.ReactNode; // Separate `title` as an optional prop
  tooltipProps?: Omit<TooltipProps, "children" | "title">; // Exclude `children` and `title`
  textProps?: Omit<TypographyProps, "children">; // Exclude `children`
  linkTo?: string;
  icon?: string | false;
}

export const ShortUUID: React.FC<ShortUUIDProps> = ({
  uuid,
  length = 10,
  title, // Allow title to be passed directly
  tooltipProps = {},
  textProps = {},
  linkTo,
  icon = "open_in_new",
}) => {
  const shortenedUUID =
    uuid.length <= length
      ? uuid
      : length <= 10
      ? `${uuid.slice(0, length - 7)}...${uuid.slice(-4)}`
      : `${uuid.slice(0, Math.ceil((length - 3) / 2))}...${uuid.slice(
          -Math.floor((length - 3) / 2)
        )}`;

  if (linkTo) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        component={Link}
        to={linkTo}
        onClick={(e) => e.stopPropagation()}
        sx={{ color: "inherit", textDecoration: "none" }}
      >
        <Typography variant="body2" component={"span"} noWrap {...textProps}>
          {shortenedUUID}
        </Typography>
        {icon && <Icon>{icon}</Icon>}
      </Stack>
    );
  }

  return (
    <Tooltip title={title || uuid} arrow {...tooltipProps}>
      <Typography variant="body2" noWrap component="span" {...textProps}>
        {shortenedUUID}
      </Typography>
    </Tooltip>
  );
};
