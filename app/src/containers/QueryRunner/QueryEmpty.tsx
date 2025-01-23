import { Box, Alert } from "@mui/material";

interface QueryEmptyProps {}

export const QueryEmpty: React.FC<QueryEmptyProps> = () => (
  <Box mt={1}>
    <Alert severity="info">No results</Alert>
  </Box>
);
