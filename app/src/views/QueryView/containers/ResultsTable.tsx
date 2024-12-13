import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface ResultsTableProps {
  rows: any[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ rows }) => {
  const gridColumns: GridColDef[] = Object.keys(rows[0]).map((c) => ({
    field: c,
    headerName: c,
    editable: true,
    // width: props.columnSize[c.column_name],
    renderCell: (params: any) =>
      typeof params.value === "object" && params.value !== null
        ? JSON.stringify(params.value, null, 2) // Pretty print JSON
        : params.value, // Render as-is for non-JSON
  }));

  const gridRows: GridRowsProp = rows.map((r, i) => ({ id: i, ...r }));

  return <DataGrid rows={gridRows} columns={gridColumns} disableColumnMenu />;
};
