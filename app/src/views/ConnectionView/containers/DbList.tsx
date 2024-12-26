import React from "react";
import { useDatabases } from "../hooks/use-databases";
import { Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Icon,
  ListItemSecondaryAction,
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
          <ListItem
            component={Link}
            to={`/${conn}/${db.name}`}
            sx={{
              color: "inherit",
              textDecoration: "none", // Ensures link doesn't show underline
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
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
            </div>
            <ListItemSecondaryAction>
              <Icon>chevron_right</Icon> {/* Disclosure Icon */}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};
