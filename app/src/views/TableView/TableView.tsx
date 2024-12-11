import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEmit } from "../../hooks/use-pubsub";
import { PageLayout } from "../../components/PageLayout";
import { ToggleTableMode } from "./containers/ToggleTableMode";
import { TableData } from "./containers/TableData";
import { TableStructure } from "./containers/TableStructure";
import { TableDLL } from "./containers/TableDLL";
import { TableInfo } from "./containers/TableInfo";

export const TableView = () => {
  const { conn, schema, table, mode } = useParams();
  useEmit("ConnectionSchema.focus", { schema, table }, 300);
  return (
    <PageLayout
      title={table}
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
            to={`/${conn}`}
            underline="hover"
            color="inherit"
          >
            {conn}
          </MUILink>
          <MUILink
            component={RouterLink}
            to={`/${conn}/${schema}`}
            underline="hover"
            color="inherit"
          >
            {schema}
          </MUILink>
          <Typography color="text.primary">{table}</Typography>
        </Breadcrumbs>
      }
      tray={<ToggleTableMode />}
    >
      {mode === "data" && <TableData />}
      {mode === "structure" && <TableStructure />}
      {mode === "dll" && <TableDLL />}
      {mode === "info" && <TableInfo />}
    </PageLayout>
  );
};
