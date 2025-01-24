import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface ResultsTableProps {
  rows: any[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ rows }) => {
  const gridColumns: GridColDef[] = Object.keys(rows[0]).map((c) => ({
    field: c,
    headerName: c,
    editable: true,
    renderCell: (params: any) => {
      const value = params.value;

      // Handle boolean values
      if (typeof value === "boolean") {
        return value ? "true" : "false";
      }

      // Handle objects (pretty-print JSON)
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value, null, 2);
      }

      // Render other types as-is
      return value;
    },
  }));

  const gridRows: GridRowsProp = rows.map((r, i) => ({ id: i, ...r }));

  return <DataGrid rows={gridRows} columns={gridColumns} disableColumnMenu />;
};
