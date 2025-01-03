import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Icon,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";

import { usePubSub } from "hooks/use-pubsub";
import { PageLayout } from "components/PageLayout";
import { useConnections } from "hooks/use-connections";
import { DidYouKnow } from "./containers/DidYouKnow";

export const HomeView = () => {
  const bus = usePubSub();
  const { items } = useConnections();

  return (
    <>
      <DidYouKnow />
      <PageLayout
        disablePadding
        title="Connection Manager"
        tray={
          <IconButton onClick={() => bus.emit("connections::manager")}>
            <Icon>edit</Icon>
          </IconButton>
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
