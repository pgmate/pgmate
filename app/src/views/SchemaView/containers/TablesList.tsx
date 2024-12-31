import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useTables, TableItem } from "../hooks/use-tables";
import { DataGrid } from "../../../components/DataGrid";

interface TablesListProps {
  conn: Connection;
  schema: string;
}

export const TablesList: React.FC<TablesListProps> = ({ conn, schema }) => {
  const navigate = useNavigate();
  const { items } = useTables(conn, schema);

  const handleDisclose = (params: any) => {
    const row: TableItem = params.row; // Extract the row data
    navigate(`/${conn.name}/${conn.database}/${schema}/${row.name}/data`);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1} mb={4}>
      <Typography variant="h2">Tables</Typography>
      <DataGrid rows={items} onRowClick={handleDisclose} />
    </Stack>
  );
};
