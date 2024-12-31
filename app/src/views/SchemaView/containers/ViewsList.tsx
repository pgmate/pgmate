import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useViews, Connection, ViewItem } from "../hooks/use-views";
import { DataGrid } from "../../../components/DataGrid";

interface ViewsListProps {
  conn: Connection;
  schema: string;
}

export const ViewsList: React.FC<ViewsListProps> = ({ conn, schema }) => {
  const navigate = useNavigate();
  const { items } = useViews(conn, schema);

  const columns = [
    { field: "name", headerName: "View Name", flex: 1 },
    { field: "depends_on", headerName: "Depends On", flex: 2 },
  ];

  const handleDisclose = (params: any) => {
    const row: ViewItem = params.row; // Extract the row data
    navigate(`/${conn.name}/${conn.database}/${schema}/${row.name}/data`);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1} mb={4}>
      <Typography variant="h2">Views</Typography>
      <DataGrid rows={items} columns={columns} onRowClick={handleDisclose} />
    </Stack>
  );
};
