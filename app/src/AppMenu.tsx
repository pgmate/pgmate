import {
  Box,
  Stack,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useURLConnection } from "hooks/use-connections";
import { Icon } from "components/Icon";
import { ConnectionSchema } from "containers/ConnectionSchema";
import { FactsTags } from "containers/FactsTags";

const primaryMenu = [
  {
    label: "Home",
    icon: "home",
    href: "/home",
  },
  {
    label: "Query",
    icon: "query_stats",
    href: "/query",
    useHidden: () => {
      const connection = useURLConnection();
      return connection === undefined;
    },
    useProps: () => {
      const connection = useURLConnection();
      return {
        href: `/${connection?.name}/${connection?.database}/query`,
      };
    },
  },
  {
    label: "Copilot",
    icon: "🤖",
    href: "/ask",
    useHidden: () => {
      const connection = useURLConnection();
      return connection === undefined;
    },
    useProps: () => {
      const connection = useURLConnection();
      return {
        href: `/${connection?.name}/${connection?.database}/ask`,
      };
    },
  },
];

const secondaryMenu = [
  {
    label: "Logout",
    icon: "logout",
    href: "/logout",
  },
];

interface MenuItemProps {
  label: string;
  icon: string;
  href: string;
  useHidden?: () => boolean;
  useProps?: () => Partial<MenuItemProps> | null;
}

interface MenuListProps {
  items: MenuItemProps[];
}

const MenuItem: React.FC<MenuItemProps> = ({
  useHidden = () => false,
  useProps = () => null,
  ...props
}) => {
  const isHidden = useHidden();
  const computedProps = useProps();

  if (isHidden === true) {
    return null;
  }

  const { label, icon, href } = {
    ...props,
    ...(computedProps || {}),
  };

  return (
    <ListItemButton key={href} component={Link} to={href}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Icon>{icon}</Icon>
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

const MenuList: React.FC<MenuListProps> = ({ items }) => (
  <List disablePadding>
    {items.map((item) => (
      <MenuItem key={item.href} {...item} />
    ))}
  </List>
);

export const AppMenu = () => {
  return (
    <Stack flex={1} flexDirection="column">
      <Box flexGrow={1}>
        <MenuList items={primaryMenu} />
        <ConnectionSchema />
        <FactsTags />
      </Box>
      <Box>
        <Divider />
        <MenuList items={secondaryMenu} />
      </Box>
    </Stack>
  );
};
