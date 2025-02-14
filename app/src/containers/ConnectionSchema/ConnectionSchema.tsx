import React, { useState } from "react";
import {
  Stack,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import { Icon } from "components/Icon";
import { useSubscribe } from "hooks/use-pubsub";
import { useTableMode } from "hooks/use-table-mode";
import { useSchemaData } from "./hooks/use-schema-data";
import { useSchemaTree } from "./hooks/use-schema-tree";
import { TableItem } from "./components/TableItem";

interface FocusedData {
  schema: string;
  table: string;
}

export const ConnectionSchema: React.FC<{ conn: Connection }> = ({ conn }) => {
  const { mode } = useTableMode();
  const { schema, refetch } = useSchemaData(conn);
  const { expandedSchemas, handleToggle } = useSchemaTree(conn);

  const [focused, setFocused] = useState<FocusedData | null>(null);
  useSubscribe("ConnectionSchema.focus", setFocused);

  return (
    <List>
      <ListSubheader onClick={() => refetch()} sx={{ cursor: "pointer" }}>
        <Stack
          direction={"row"}
          spacing={1}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          Tables
          <Tooltip title="Refresh tables list">
            <Icon>refresh</Icon>
          </Tooltip>
        </Stack>
      </ListSubheader>
      {schema.map((schema) => {
        const isExpanded = expandedSchemas.has(schema.name);

        return (
          <React.Fragment key={schema.name}>
            {/* Schema List Item */}
            <ListItem disablePadding>
              <ListItemButton
                selected={schema.name === focused?.schema}
                onClick={() => handleToggle(schema.name)}
                sx={{
                  height: "30px",
                  ...(schema.name === focused?.schema
                    ? {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                      }
                    : {}),
                  ...(isExpanded
                    ? {
                        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                      }
                    : {}),
                  borderColor: (theme) => theme.palette.divider,
                }}
              >
                <ListItemText primary={schema.name} />
                {schema.tables.length > 0 && (
                  <Icon rotate={isExpanded}>expand_more</Icon>
                )}
              </ListItemButton>
            </ListItem>

            {/* Collapsible List for Tables */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ mb: 2 }}>
                {schema.tables.map((table) => (
                  <TableItem
                    {...table}
                    conn={conn}
                    mode={mode}
                    selected={table.name === focused?.table}
                    schema={schema.name}
                    key={table.name}
                  />
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      })}
    </List>
  );
};
