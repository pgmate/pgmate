import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageLayout } from "components/PageLayout";
import { useEventData } from "hooks/use-pubsub";
import { Chat } from "./containers/Chat";
import { DisplayUsage } from "./components/DisplayUsage";

export const AskView = () => {
  const params = useParams<{
    conn: string;
    db: string;
  }>();

  const usage = useEventData("ask:usage");
  const estimate = useEventData("ask:estimate");

  return (
    <PageLayout
      disablePadding
      disableMargins
      stickyHeader
      forceStickyHeader
      meta={{ title: `${params.db}: SQL Studio` }}
      title={"🤖 Copilot"}
      subtitle={
        <Breadcrumbs aria-label="breadcrumb">
          <MUILink
            component={RouterLink}
            to="/"
            underline="hover"
            color="inherit"
          >
            Home
          </MUILink>
          <MUILink
            component={RouterLink}
            to={`/${params.conn}`}
            underline="hover"
            color="inherit"
          >
            {params.conn}
          </MUILink>
          <MUILink
            component={RouterLink}
            to={`/${params.conn}/${params.db}`}
            underline="hover"
            color="inherit"
          >
            {params.db}
          </MUILink>
          <Typography color="text.primary">Copilot</Typography>
        </Breadcrumbs>
      }
      tray={
        estimate ? <DisplayUsage usage={usage} estimate={estimate} /> : null
      }
      bodyProps={{
        sx: {
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Chat />
    </PageLayout>
  );
};
