import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { Column } from "../hooks/use-table-schema";

export const TableColumns: React.FC<{ columns: Column[] }> = ({ columns }) => (
  <Box>
    <Typography variant="h3" sx={{ mb: 1 }}>
      Columns
    </Typography>

    <TableContainer component={Paper}>
      <Table>
        {/* Table Header */}
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Type</strong>
            </TableCell>
            <TableCell>
              <strong>Default</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Not Null</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Primary Key</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {columns.map((column: Column) => (
            <TableRow key={column.name}>
              <TableCell>{column.name}</TableCell>
              <TableCell>{column.type}</TableCell>
              <TableCell>{column.default || "NULL"}</TableCell>
              <TableCell align="center">
                {column.not_null ? "✅" : "❌"}
              </TableCell>
              <TableCell align="center">
                {column.is_pkey ? "✅" : "❌"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
