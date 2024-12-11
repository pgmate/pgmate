import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

import { PageLayout } from "../../components/PageLayout";
import { useConnections } from "../../hooks/use-connections";
import { DidYouKnow } from "./containers/DidYouKnow";

export const HomeView = () => {
  const { items } = useConnections();

  return (
    <>
      <DidYouKnow />
      <PageLayout disablePadding title="Connection Manager">
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
