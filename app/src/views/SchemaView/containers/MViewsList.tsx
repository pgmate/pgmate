import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { DataGrid } from "components/DataGrid";
import { useMViews, MViewItem } from "../hooks/use-mviews";

interface MViewsListProps {
  conn: Connection;
  schema: string;
}

export const MViewsList: React.FC<MViewsListProps> = ({ conn, schema }) => {
  const navigate = useNavigate();
  const { items } = useMViews(conn, schema);

  // const columns = [
  //   { field: "name", headerName: "View Name", flex: 1 },
  //   { field: "depends_on", headerName: "Depends On", flex: 2 },
  // ];

  const handleDisclose = (params: any) => {
    const row: MViewItem = params.row; // Extract the row data
    navigate(`/${conn.name}/${conn.database}/${schema}/${row.name}/data`);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1} mb={4}>
      <Typography variant="h2">Materialized Views</Typography>
      <DataGrid rows={items} onRowClick={handleDisclose} />
    </Stack>
  );
};
