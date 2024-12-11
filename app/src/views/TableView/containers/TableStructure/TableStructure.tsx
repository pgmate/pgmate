import { Stack } from "@mui/material";
import { useTableSchema } from "./hooks/use-table-schema";
import { TableColumns } from "./components/TableColumns";
import { TableConstraints } from "./components/TableConstraints";
import { TableIndexes } from "./components/TableIndexes";

export const TableStructure = () => {
  const { columns, constraints, indexes } = useTableSchema();

  return (
    <Stack spacing={4}>
      <TableColumns columns={columns} />
      <TableConstraints constraints={constraints} />
      <TableIndexes indexes={indexes} />
    </Stack>
  );
};
