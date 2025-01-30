import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Stack, IconButton, Icon, Button } from "@mui/material";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridColumnResizeParams,
} from "@mui/x-data-grid";
import { CodeViewer } from "components/CodeViewer";
import { useEmit } from "hooks/use-pubsub";
import { useTableData } from "./hooks/use-table-data";
import { useTableProps } from "./hooks/use-table-props";

interface TableDataProps {
  conn: Connection;
}

const measureTextLength = (text: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 15;
  ctx.font = "15px Roboto";
  return ctx.measureText(text).width + 40;
};

export const TableData: React.FC<TableDataProps> = ({ conn }) => {
  const params = useParams<{
    conn: string;
    schema: string;
    table: string;
  }>();
  const { schema, table } = params;
  useEmit("ConnectionSchema.focus", { schema, table }, 300);

  const props = useTableProps();

  const data = useTableData(conn!, schema!, table!, {
    initialPage: props.page,
    initialPageSize: props.pageSize,
    initialSorting: props.sorting,
  });

  useEffect(() => {
    data.setPage(props.page);
    data.setPageSize(props.pageSize);
    data.setSorting(props.sorting);
  }, [props]);

  const columns: GridColDef[] = [
    ...data.columns.map((c) => ({
      field: c.column_name,
      headerName: c.column_name,
      editable: true,
      width:
        props.columnSize[c.column_name] || measureTextLength(c.column_name),
      renderCell: (params: any) =>
        typeof params.value === "boolean" // Handle booleans
          ? params.value
            ? "true"
            : "false"
          : typeof params.value === "object" && params.value !== null // Pretty print JSON for objects
          ? JSON.stringify(params.value, null, 2)
          : params.value, // Render other types as-is
      renderEditCell:
        c.data_type === "json" || c.data_type === "jsonb"
          ? (params: any) => (
              <textarea
                defaultValue={
                  typeof params.value === "object" && params.value !== null
                    ? JSON.stringify(params.value, null, 2)
                    : params.value
                }
                style={{ width: "100%", height: "100%" }}
                onChange={(event) => {
                  try {
                    // Parse the input and update the cell value
                    const updatedValue = JSON.parse(event.target.value);
                    params.api.setEditCellValue({
                      id: params.id,
                      field: c.column_name,
                      value: updatedValue,
                    });
                  } catch (error) {
                    console.error("Invalid JSON:", error);
                  }
                }}
              />
            )
          : undefined,
    })),
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 80,
      align: "right",
      renderCell: (params) => (
        <IconButton onClick={() => data.deleteRow(params.row)}>
          <Icon>delete_outline</Icon>
        </IconButton>
      ),
    },
  ];

  const rows: GridRowsProp = data?.rows?.map((r, i) => ({ id: i, ...r }));

  const onPaginationModelChange = (params: any) => {
    props.update({
      page: params.page,
      pageSize: params.pageSize,
    });
  };

  const onSortingModelChange = (params: any) => {
    props.update({
      sorting: params,
    });
  };

  const onColumnWidthChange = (params: GridColumnResizeParams) => {
    console.log("@@@ onColumnWidthChange", params.colDef.field, params.width);
    props.updateColumnSize(params.colDef.field, params.width);
  };

  const processRowUpdate = (updatedRow: any, originalRow: any) => {
    // Validate JSON fields before updating
    data.columns.forEach((col) => {
      if (
        (col.data_type === "json" || col.data_type === "jsonb") &&
        typeof updatedRow[col.column_name] === "string"
      ) {
        try {
          updatedRow[col.column_name] = JSON.parse(updatedRow[col.column_name]);
        } catch (error) {
          console.error("Invalid JSON:", error);
          throw new Error("Invalid JSON format");
        }
      }
    });

    // Pass the validated updatedRow to updateRow
    return data.updateRow(updatedRow, originalRow);
  };

  const onProcessRowUpdateError = (error: any) => {
    console.log("ERROR EDITING", error);
  };

  return (
    <Stack spacing={1}>
      <CodeViewer code={data.query || ""} language="sql" />
      <DataGrid
        rows={rows}
        columns={columns}
        density="compact"
        disableColumnMenu
        pageSizeOptions={[5, 25, 50, 100]}
        rowCount={-1}
        paginationMode="server"
        paginationModel={{
          page: data.page,
          pageSize: data.pageSize,
        }}
        onPaginationModelChange={onPaginationModelChange}
        sortingMode="server"
        onSortModelChange={onSortingModelChange}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={onProcessRowUpdateError}
        onColumnWidthChange={onColumnWidthChange}
      />
      <Button variant="outlined" onClick={() => data.addRow()}>
        Add new row
      </Button>
    </Stack>
  );
};
