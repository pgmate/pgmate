import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

interface ResultsTableProps {
  rows: any[];
}

const measureTextLength = (text: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 15;
  ctx.font = "15px Roboto";
  return ctx.measureText(text).width + 40;
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ rows }) => {
  try {
    const gridColumns: GridColDef[] = Object.keys(rows[0]).map((c) => ({
      field: c,
      headerName: c,
      width: measureTextLength(c),
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

    return (
      <DataGrid
        rows={gridRows}
        columns={gridColumns}
        disableColumnMenu
        density="compact"
      />
    );
  } catch (e) {
    console.log("rows", rows);
    return "failed rendering dataset";
  }
};
