import {
  TableRow as MUITableRow,
  TableRowProps as MUITableRowProps,
  TableCell,
} from "@mui/material";

export interface TableHeaderProps<Row extends Record<string, any>> {
  row: Row;
  rowProps?: MUITableRowProps;
}

export const TableHeader = <Row extends Record<string, any>>({
  row,
  rowProps,
}: TableHeaderProps<Row>) => {
  if (!row) return null;
  return (
    <MUITableRow {...rowProps}>
      {Object.keys(row)
        .filter((key) => key.substring(0, 2) !== "__")
        .map((key) => (
          <TableCell key={key} sx={{ fontWeight: "bold" }}>
            {key}
          </TableCell>
        ))}
    </MUITableRow>
  );
};
