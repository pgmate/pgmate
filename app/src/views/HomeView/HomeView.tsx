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
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import { usePubSub } from "hooks/use-pubsub";
import { useConnections } from "hooks/use-connections";
import { useClipboard } from "hooks/use-clipboard";
import { PageLayout } from "components/PageLayout";
import { DidYouKnow } from "./containers/DidYouKnow";
import { ArticlesWall } from "./containers/ArticlesWall";

export const HomeView = () => {
  const bus = usePubSub();
  const clipboard = useClipboard();
  const { items } = useConnections();

  return (
    <Grid container>
      <Grid size={{ lg: 4, md: 6, sm: 12 }}>
        <DidYouKnow />
      </Grid>
      <Grid size={{ lg: 8, md: 6, sm: 12 }}>
        <PageLayout
          disablePadding
          title={
            <Stack direction={"row"} spacing={2}>
              <Icon>hub</Icon>
              <Typography variant="h4">Connect to:</Typography>
            </Stack>
          }
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
                      secondary={
                        item.desc || `${item.username}@${item.database}`
                      }
                    />
                    <Icon>chevron_right</Icon>
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </PageLayout>
      </Grid>
      <Grid size={12} sx={{ mt: 2, mb: 4 }}>
        <Divider />
      </Grid>
      <Grid size={12} sx={{ px: 2 }}>
        <Typography variant="h1" mb={4}>
          Latest from the Community:
        </Typography>
        <ArticlesWall />
      </Grid>
    </Grid>
  );
};
