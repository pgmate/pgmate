import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEmit } from "hooks/use-pubsub";
import { useConnection } from "hooks/use-connections";
import { PageLayout } from "components/PageLayout";
import { ToggleTableMode } from "./containers/ToggleTableMode";
import { TableData } from "./containers/TableData";
import { TableStructure } from "./containers/TableStructure";
import { TableDLL } from "./containers/TableDLL";
import { TableInfo } from "./containers/TableInfo";

export const TableView = () => {
  const params = useParams<{
    conn: string;
    db: string;
    schema: string;
    table: string;
    mode: string;
  }>();
  const conn = useConnection(params.conn!, params.db!);
  useEmit(
    "ConnectionSchema.focus",
    { schema: params.schema, table: params.table },
    300
  );
  return (
    <PageLayout
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
      {conn && params.mode === "data" && <TableData conn={conn} />}
      {conn && params.mode === "structure" && <TableStructure />}
      {conn && params.mode === "dll" && <TableDLL />}
      {conn && params.mode === "info" && <TableInfo />}
    </PageLayout>
  );
};
