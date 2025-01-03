import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useConnection } from "hooks/use-connections";

import { PageLayout } from "components/PageLayout";
import { SchemasList } from "./containers/SchemasList";

export const DatabaseView = () => {
  const params = useParams<{ conn: string; db: string }>();
  const conn = useConnection(params.conn!, params.db!);

  return (
    <PageLayout
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
      {conn && <SchemasList conn={conn} />}
    </PageLayout>
  );
};
