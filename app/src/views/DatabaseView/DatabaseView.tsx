import { useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Link as MUILink,
  Typography,
  Tooltip,
  Icon,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link as RouterLink } from "react-router-dom";
import { useURLConnection } from "hooks/use-connections";
import { usePubSub } from "hooks/use-pubsub";
import { PageLayout } from "components/PageLayout";
import { CreateSchema } from "popups/CreateSchema";
import { SchemasList } from "./components/SchemasList";
import { DiskCharts } from "./containers/DiskCharts";
import { SunburstChart } from "./containers/SunburstChart";
import { useSchemas } from "./hooks/use-schemas";
// import { TreeMap } from "./containers/TreeMap";

export const DatabaseView = () => {
  const bus = usePubSub();
  const navigate = useNavigate();
  const conn = useURLConnection();
  const schema = useSchemas(conn!);

  if (!conn) return null;

  return (
    <PageLayout
      disablePadding
      disableMargins
      stickyHeader
      meta={{ title: `db: ${conn.database}` }}
      title={conn.database}
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
          <Typography color="text.primary">{conn.database}</Typography>
        </Breadcrumbs>
      }
      tray={
        <Tooltip title="Create new Schema">
          <IconButton onClick={() => bus.emit("create:schema")}>
            <Icon>add</Icon>
          </IconButton>
        </Tooltip>
      }
    >
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SunburstChart conn={conn} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DiskCharts conn={conn} />
          </Grid>
        </Grid>
      </Box>
      <SchemasList conn={conn} items={schema.items} />
      <CreateSchema onComplete={(path) => navigate(`/${path}`)} />
    </PageLayout>
  );
};
