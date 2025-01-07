import { useParams } from "react-router-dom";
import {
  Breadcrumbs,
  Link as MUILink,
  Typography,
  Button,
  Icon,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useConnection } from "hooks/use-connections";
import { usePubSub } from "hooks/use-pubsub";
import { PageLayout } from "components/PageLayout";
import { QueryView } from "./QueryView";

export const QueryViewWrapper = () => {
  const bus = usePubSub();
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
          <Typography color="text.primary">SQL Studio</Typography>
        </Breadcrumbs>
      }
      tray={
        <Button
          variant="contained"
          color="primary"
          size="small"
          endIcon={<Icon>play_circle_filled</Icon>}
          onClick={() => bus.emit("QueryView.run")}
        >
          Run Selection
        </Button>
      }
    >
      <QueryView conn={conn} />
    </PageLayout>
  );
};
