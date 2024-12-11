import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEmit } from "../../hooks/use-pubsub";
import { PageLayout } from "../../components/PageLayout";

export const SchemaView = () => {
  const { conn, schema } = useParams();
  useEmit("ConnectionSchema.focus", { schema, table: null }, 300);
  return (
    <PageLayout
      title={schema}
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
          <Typography color="text.primary">{schema}</Typography>
        </Breadcrumbs>
      }
    >
      ...coming soon...
    </PageLayout>
  );
};
