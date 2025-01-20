import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useConnection } from "hooks/use-connections";
import { PageLayout } from "components/PageLayout";
import { Text2SQLView } from "./Text2SQLView";

export const Text2SQLWrapper = () => {
  const params = useParams<{
    conn: string;
    db: string;
  }>();

  const conn = useConnection(params.conn!, params.db!);
  if (!conn) return null;

  return (
    <PageLayout
      disablePadding
      disableMargins
      stickyHeader
      forceStickyHeader
      meta={{ title: `${conn.database}: SQL Studio` }}
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
            to={`/${conn?.name}`}
            underline="hover"
            color="inherit"
          >
            {conn?.name}
          </MUILink>
          <MUILink
            component={RouterLink}
            to={`/${conn?.name}/${conn?.database}`}
            underline="hover"
            color="inherit"
          >
            {conn?.database}
          </MUILink>
          <Typography color="text.primary">🤖 Text2SQL</Typography>
        </Breadcrumbs>
      }
    >
      <Text2SQLView />
    </PageLayout>
  );
};
