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

export interface Index {
  name: string;
  column: string;
  is_unique: boolean;
  is_primary: boolean;
  definition: string;
}

export const TableIndexes: React.FC<{ indexes: Index[] }> = ({ indexes }) =>
  indexes.length > 0 && (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Indexes
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
                <strong>Column</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Unique</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Primary</strong>
              </TableCell>
              <TableCell>
                <strong>Definition</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {indexes.map((index) => (
              <TableRow key={index.name + index.column}>
                <TableCell>{index.name}</TableCell>
                <TableCell>{index.column}</TableCell>
                <TableCell align="center">
                  {index.is_unique ? "✅" : "❌"}
                </TableCell>
                <TableCell align="center">
                  {index.is_primary ? "✅" : "❌"}
                </TableCell>
                <TableCell>{index.definition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
