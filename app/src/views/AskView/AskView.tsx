import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageLayout } from "components/PageLayout";
import { Chat } from "./containers/Chat";

export const AskView = () => {
  const params = useParams<{
    conn: string;
    db: string;
  }>();

  return (
    <PageLayout
      disablePadding
      disableMargins
      stickyHeader
      forceStickyHeader
      meta={{ title: `${params.db}: SQL Studio` }}
      title={"SQL Studio"}
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
          <Typography color="text.primary">🤖 Ask AL</Typography>
        </Breadcrumbs>
      }
    >
      <Chat />
    </PageLayout>
  );
};
