import { Box, Alert } from "@mui/material";

interface QueryEmptyProps {
  scrollId?: string; // Unique identifier for scrolling
}

export const QueryEmpty: React.FC<QueryEmptyProps> = ({
  scrollId = crypto.randomUUID(), // Default to a unique random ID
}) => {
  return (
    <Box id={scrollId} mt={1}>
      <Alert severity="info">No results</Alert>
    </Box>
  );
};
