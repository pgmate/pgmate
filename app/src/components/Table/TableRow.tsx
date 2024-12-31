import {
  TableRow as MUITableRow,
  TableRowProps as MUITableRowProps,
  TableCell,
} from "@mui/material";
import { CodeBox } from "components/CodeBox";

export interface TableRowProps<Row extends Record<string, any>> {
  row: Row;
  rowProps: MUITableRowProps;
}

export const TableRow = <Row extends Record<string, any>>({
  row,
  rowProps,
}: TableRowProps<Row>) => {
  // console.log(row);
  return (
    <MUITableRow {...rowProps}>
      {Object.keys(row as any)
        .filter((key) => key.substring(0, 2) !== "__")
        .map((key) => (
          <TableCell key={key}>
            {typeof row[key] === "object" ? (
              <CodeBox data={row[key]} />
            ) : (
              row[key]
            )}
          </TableCell>
        ))}
    </MUITableRow>
  );
};
