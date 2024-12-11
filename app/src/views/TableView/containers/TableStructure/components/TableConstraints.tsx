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
import { Constraint } from "../hooks/use-table-schema";

export const TableConstraints: React.FC<{ constraints: Constraint[] }> = ({
  constraints,
}) =>
  constraints.length > 0 && (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Constraints
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
                <strong>Columns</strong>
              </TableCell>
              <TableCell>
                <strong>Definition</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {constraints.map((constraint) => (
              <TableRow key={constraint.name}>
                <TableCell>{constraint.name}</TableCell>
                <TableCell>{constraint.type}</TableCell>
                <TableCell>
                  {constraint.columns} {/* Convert array to string */}
                </TableCell>
                <TableCell>{constraint.definition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
