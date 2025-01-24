import { useRef, useEffect } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { SizedBox } from "components/SizedBox";

interface QueryResultsProps<T extends Record<string, any>> {
  data: {
    rows: T[];
  };
}

export const QueryResults = <T extends Record<string, any>>({
  data,
}: QueryResultsProps<T>) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const gridColumns: GridColDef[] = Object.keys(data.rows[0]).map((c) => ({
    field: c,
    headerName: c,
    editable: true,
    renderCell: (params: any) =>
      typeof params.value === "boolean" // Handle booleans
        ? params.value
          ? "true"
          : "false"
        : typeof params.value === "object" && params.value !== null // Pretty print JSON for objects
        ? JSON.stringify(params.value, null, 2)
        : params.value, // Render other types as-is
  }));

  const gridRows: GridRowsProp = data.rows.map((r, i) => ({ id: i, ...r }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div>
      <SizedBox>
        {(size) => (
          <Box
            mt={1}
            sx={{
              display: "block",
              width: size.width,
              overflowX: "auto",
            }}
          >
            <DataGrid
              rows={gridRows}
              columns={gridColumns}
              disableColumnMenu
              autoPageSize={false} // Disable auto page size to respect initial page size
              pageSizeOptions={[5, 10, 25, 50]} // Optional: Allow users to select other page sizes
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5, // Set initial page size
                    page: 0, // Optional: Set initial page to 0
                  },
                },
              }}
              sx={{
                width: "100%",
                minWidth: 300,
              }}
            />
          </Box>
        )}
      </SizedBox>
      <div ref={messagesEndRef} style={{ marginTop: 25 }} />
    </div>
  );
};
