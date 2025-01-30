import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  Link as MUILink,
  Typography,
  Icon,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageLayout } from "components/PageLayout";
import { CreateDB } from "popups/CreateDb";
import { useURLConnection } from "hooks/use-connections";
import { usePubSub } from "hooks/use-pubsub";
import { useDatabases } from "./hooks/use-databases";
import { DBList } from "./components/DbList";

export const ConnectionView: React.FC = () => {
  const navigate = useNavigate();
  const bus = usePubSub();
  const conn = useURLConnection();
  const { items } = useDatabases(conn!);

  if (!conn) return null;

  return (
    <PageLayout
      disablePadding
      meta={{ title: `conn: ${conn.name}` }}
      title={conn.desc || conn.name}
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
          <Typography color="text.primary">{conn?.name}</Typography>
        </Breadcrumbs>
      }
      tray={
        <Tooltip title="Create new Database">
          <IconButton onClick={() => bus.emit("create:db")}>
            <Icon>add</Icon>
          </IconButton>
        </Tooltip>
      }
    >
      <DBList conn={conn} items={items} />
      <CreateDB onComplete={(path) => navigate(`/${path}`)} />
    </PageLayout>
  );
};
