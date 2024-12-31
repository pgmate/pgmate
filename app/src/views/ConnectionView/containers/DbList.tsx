import React from "react";
import { useDatabases } from "../hooks/use-databases";
import { Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Icon,
} from "@mui/material";
import { HealthRate } from "../components/HealthRate";

interface DBListProps {
  conn: string;
}

export const DBList: React.FC<DBListProps> = ({ conn }) => {
  const { items } = useDatabases(conn!);

  return (
    <List>
      {items.map((db) => (
        <React.Fragment key={db.name}>
          <ListItem disablePadding disableGutters>
            <ListItemButton component={Link} to={`/${conn}/${db.name}`}>
              <ListItemIcon>
                <HealthRate
                  health_factor={db.health_factor}
                  health_rate={db.health_rate}
                  committed_ts={db.committed_ts}
                  rolled_back_ts={db.rolled_back_ts}
                />
              </ListItemIcon>
              <ListItemText
                primary={db.name}
                secondary={`Size: ${db.size_readable} | Owner: ${db.owner}`}
              />
              <Icon>chevron_right</Icon>
            </ListItemButton>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};
