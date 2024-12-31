import React from "react";
import {
  DataGrid as MuiDataGrid,
  GridRowsProp,
  GridColDef,
  DataGridProps as MuiDataGridProps,
} from "@mui/x-data-grid";

interface DataGridProps extends Omit<MuiDataGridProps, "columns"> {
  rows: GridRowsProp;
  columns?: GridColDef[]; // Optional columns
}

export const DataGrid: React.FC<DataGridProps> = ({
  rows,
  columns,
  paginationModel = { pageSize: 25, page: 0 }, // Default pagination model
  pagination = true, // Enable pagination by default
  ...rest
}) => {
  const _columns: GridColDef[] =
    columns ||
    (rows[0] ? Object.keys(rows[0]).map((field) => ({ field })) : []);

  const _rows: GridRowsProp = rows[0]
    ? Object.keys(rows[0]).includes("id")
      ? rows
      : rows.map((item, id) => ({ id, ...item }))
    : [];

  return (
    <MuiDataGrid
      rows={_rows}
      columns={_columns}
      pagination={pagination}
      paginationModel={paginationModel}
      {...rest}
    />
  );
};
