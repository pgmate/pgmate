import React from "react";
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
import { HealthRate } from "./HealthRate";
import type { DatabaseItem } from "../hooks/use-databases";

interface DBListProps {
  conn: Connection;
  items: DatabaseItem[];
}

export const DBList: React.FC<DBListProps> = ({ conn, items }) => {
  return (
    <List>
      {items.map((db) => (
        <React.Fragment key={db.name}>
          <ListItem disablePadding disableGutters>
            <ListItemButton component={Link} to={`/${conn.name}/${db.name}`}>
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
                secondary={
                  <>
                    {db.description && (
                      <>
                        {db.description}
                        <br />
                      </>
                    )}
                    Size: {db.size_readable} | Owner: {db.owner}
                  </>
                }
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
