import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Icon,
} from "@mui/material";
import { Link } from "react-router-dom";

import { usePubSub } from "../../hooks/use-pubsub";
import { PageLayout } from "../../components/PageLayout";
import { useConnections } from "../../hooks/use-connections";
import { DidYouKnow } from "./containers/DidYouKnow";

export const HomeView = () => {
  const bus = usePubSub();
  const { items } = useConnections();

  console.log(items);

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
            <ListItem key={item.name}>
              <ListItemButton component={Link} to={`/${item.name}`}>
                <ListItemText primary={item.name} secondary={item.desc} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </PageLayout>
    </>
  );
};
