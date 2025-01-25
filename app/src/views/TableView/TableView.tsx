import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEmit } from "hooks/use-pubsub";
import { useConnection } from "hooks/use-connections";
import { PageLayout } from "components/PageLayout";
import { ToggleTableMode } from "./containers/ToggleTableMode";
import { TableData } from "./containers/TableData";
import { TableStructure } from "./containers/TableStructure";
import { TableDDL } from "./containers/TableDDL";
import { TableInfo } from "./containers/TableInfo";

export const TableView = () => {
  const params = useParams<{
    conn: string;
    db: string;
    schema: string;
    table: string;
    mode: string;
  }>();

  useEmit(
    "ConnectionSchema.focus",
    { schema: params.schema, table: params.table },
    300
  );

  const conn = useConnection(params.conn!, params.db!);
  if (!conn) return null;

  return (
    <PageLayout
      disableMargins
      stickyHeader
      meta={{ title: `${params.mode}: ${params.table}` }}
      title={params.table}
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
          <MUILink
            component={RouterLink}
            to={`/${conn?.name}/${conn?.database}/${params.schema}`}
            underline="hover"
            color="inherit"
          >
            {params.schema}
          </MUILink>
          <Typography color="text.primary">{params.table}</Typography>
        </Breadcrumbs>
      }
      tray={<ToggleTableMode />}
    >
      {params.mode === "data" && <TableData conn={conn} />}
      {params.mode === "structure" && <TableStructure />}
      {params.mode === "ddl" && <TableDDL />}
      {params.mode === "info" && <TableInfo />}
    </PageLayout>
  );
};
