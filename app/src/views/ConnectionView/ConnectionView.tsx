import { useParams } from "react-router-dom";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PageLayout } from "../../components/PageLayout";
import { useConnection } from "../../hooks/use-connections";

export const ConnectionView: React.FC = () => {
  const params = useParams<{ conn: string }>();
  const conn = useConnection(params.conn!);

  return (
    <PageLayout
      title={conn?.desc || conn?.name}
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
      ... here we will place a dashboard with connection details ...
    </PageLayout>
  );
};
