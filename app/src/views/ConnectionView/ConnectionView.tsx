import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageLayout } from "components/PageLayout";
import { useConnection } from "hooks/use-connections";
import { DBList } from "./containers/DbList";

export const ConnectionView: React.FC = () => {
  const params = useParams<{ conn: string }>();
  const conn = useConnection(params.conn!);

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
    >
      <DBList conn={params.conn!} />
    </PageLayout>
  );
};
