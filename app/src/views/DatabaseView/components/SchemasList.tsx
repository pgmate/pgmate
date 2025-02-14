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
import { SchemaItem } from "../hooks/use-schemas";

interface SchemasListProps {
  conn: Connection;
  items: SchemaItem[];
}

export const SchemasList: React.FC<SchemasListProps> = ({ conn, items }) => {
  return (
    <List>
      {items.map((schema) => (
        <React.Fragment key={schema.schema_name}>
          <ListItem disablePadding disableGutters>
            <ListItemButton
              component={Link}
              to={`/${conn.name}/${conn.database}/${schema.schema_name}`}
            >
              <ListItemIcon>
                <Icon>folder</Icon>
              </ListItemIcon>
              <ListItemText
                primary={schema.schema_name}
                secondary={
                  <>
                    {schema.description && (
                      <>
                        {schema.description}
                        <br />
                      </>
                    )}
                    Size: {schema.total_size_readable} | {schema.tables_count}{" "}
                    tables
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
