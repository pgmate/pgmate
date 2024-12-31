import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { Icon } from "../../../components/Icon";

interface TableItemProps {
  conn: Connection;
  mode: string;
  schema: string;
  name: string;
  type: "VIEW" | "BASE TABLE" | "MATERIALIZED VIEW";
  selected?: boolean;
}

export const TableItem: React.FC<TableItemProps> = ({
  conn,
  mode,
  schema,
  name,
  type,
  selected,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        disableGutters
        selected={selected}
        component={Link}
        to={`/${conn.name}/${conn.database}/${schema}/${name}/${mode}`}
        sx={{ pl: 2, height: "30px" }}
      >
        <Icon
          sx={{
            mr: 1,
            color:
              type === "VIEW"
                ? (theme) =>
                    theme.palette.mode === "light"
                      ? theme.palette.primary.main
                      : theme.palette.primary.light
                : type === "MATERIALIZED VIEW"
                ? (theme) =>
                    theme.palette.mode === "light"
                      ? theme.palette.success.main
                      : theme.palette.success.light
                : "inherit",
          }}
        >
          table_chart
        </Icon>
        <ListItemText
          secondary={name}
          sx={{
            fontStyle: type === "VIEW" ? "italic" : "inherit",
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};
