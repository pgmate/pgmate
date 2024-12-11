import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { Icon } from "../../../components/Icon";

interface TableItemProps {
  conn: string;
  mode: string;
  schema: string;
  name: string;
  type: "VIEW" | "BASE TABLE";
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
        to={`/${conn}/${schema}/${name}/${mode}`}
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
