import React from "react";
import { Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Icon,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";

import { usePubSub } from "hooks/use-pubsub";
import { useConnections } from "hooks/use-connections";
import { useClipboard } from "hooks/use-clipboard";
import { PageLayout } from "components/PageLayout";
import { DidYouKnow } from "./containers/DidYouKnow";

export const HomeView = () => {
  const bus = usePubSub();
  const clipboard = useClipboard();
  const { items } = useConnections();

  return (
    <>
      <DidYouKnow />
      <PageLayout
        disablePadding
        title="Connection Manager"
        tray={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Import connection from clipboard">
              <IconButton
                onClick={() => {
                  bus.emit("connections::manager");
                  clipboard.paste();
                }}
              >
                <Icon>content_paste</Icon>
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => bus.emit("connections::manager")}>
              <Icon>edit</Icon>
            </IconButton>
          </Stack>
        }
      >
        <List>
          {items.map((item) => (
            <React.Fragment key={item.name}>
              <ListItem disablePadding disableGutters>
                <ListItemButton
                  component={Link}
                  to={
                    item.database
                      ? `/${item.name}/${item.database}`
                      : `/${item.name}`
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={item.desc || `${item.username}@${item.database}`}
                  />
                  <Icon>chevron_right</Icon>
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </PageLayout>
    </>
  );
};
