import { useParams } from "react-router-dom";
import { Box, Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link as RouterLink } from "react-router-dom";
import { useConnection } from "hooks/use-connections";

import { PageLayout } from "components/PageLayout";
import { SchemasList } from "./containers/SchemasList";
import { DiskCharts } from "./containers/DiskCharts";
import { SunburstChart } from "./containers/SunburstChart";
// import { TreeMap } from "./containers/TreeMap";

export const DatabaseView = () => {
  const params = useParams<{ conn: string; db: string }>();
  const conn = useConnection(params.conn!, params.db!);

  return (
    <PageLayout
      disablePadding
      title={params.db}
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
          <Typography color="text.primary">{params.db}</Typography>
        </Breadcrumbs>
      }
    >
      {conn && (
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
      )}
      {conn && <SchemasList conn={conn} />}
    </PageLayout>
  );
};
