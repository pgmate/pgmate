import { useParams } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Chip,
  Icon,
  IconButton,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout";
import { useFacts } from "./hooks/use-fatcs";

export const FactsView = () => {
  const { tag } = useParams();
  const { items, loadMore, thumbUp, thumbDown } = useFacts(tag!);
  return (
    <PageLayout title={tag} subtitle="Interesting facts about Postgres">
      <List disablePadding>
        {items.map((fact) => (
          <ListItem key={fact.uuid} disablePadding sx={{ mb: 4 }}>
            <Stack>
              <ListItemText primary={fact.title} secondary={fact.description} />
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Stack spacing={1} direction={"row"}>
                  {fact.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      component={Link}
                      to={`/facts/${encodeURIComponent(tag)}`}
                      sx={{ cursor: "pointer" }}
                      size={"small"}
                    />
                  ))}
                </Stack>
                <Stack direction={"row"}>
                  {fact.links.length && (
                    <>
                      <IconButton
                        component={Link}
                        to={fact.links[0]}
                        target="_blank"
                      >
                        <Icon sx={{ fontSize: 20 }}>ios_share</Icon>
                      </IconButton>
                      <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
                    </>
                  )}
                  <IconButton onClick={() => thumbUp(fact)}>
                    <Icon
                      color={fact.hits > 0 ? "primary" : "inherit"}
                      sx={{
                        fontSize: 20,
                      }}
                    >
                      thumb_up
                    </Icon>
                  </IconButton>
                  <IconButton onClick={() => thumbDown(fact)}>
                    <Icon
                      color={fact.hits < 0 ? "error" : "inherit"}
                      sx={{ fontSize: 20 }}
                    >
                      thumb_down
                    </Icon>
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </ListItem>
        ))}
      </List>
      <Button fullWidth onClick={() => loadMore()}>
        Load More
      </Button>
    </PageLayout>
  );
};
