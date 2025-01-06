import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEmit } from "hooks/use-pubsub";
import { useConnection } from "hooks/use-connections";
import { PageLayout } from "components/PageLayout";
import { TablesList } from "./containers/TablesList";
import { ViewsList } from "./containers/ViewsList";
import { MViewsList } from "./containers/MViewsList";

export const SchemaView = () => {
  const params = useParams<{ conn: string; db: string; schema: string }>();
  const conn = useConnection(params.conn!, params.db!);

  useEmit(
    "ConnectionSchema.focus",
    { schema: params.schema, table: null },
    300
  );

  if (!conn) return null;

  return (
    <PageLayout
      disableMargins
      stickyHeader
      title={params.schema}
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
          <Typography color="text.primary">{params.schema}</Typography>
        </Breadcrumbs>
      }
      meta={{ title: `schema: ${params.schema}` }}
    >
      <TablesList conn={conn} schema={params.schema!} />
      <ViewsList conn={conn} schema={params.schema!} />
      <MViewsList conn={conn} schema={params.schema!} />
    </PageLayout>
  );
};
