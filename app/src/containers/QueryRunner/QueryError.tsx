import { Box, Alert, Button } from "@mui/material";

interface QueryErrorProps {
  error: Error;
  onRequestFix?: (error: Error) => void;
  scrollId?: string; // Unique identifier for scrolling
}

export const QueryError: React.FC<QueryErrorProps> = ({
  error,
  onRequestFix,
  scrollId = crypto.randomUUID(), // Default to a unique random ID
}) => {
  return (
    <Box id={scrollId} mt={1}>
      <Alert
        severity="error"
        action={
          <Button endIcon={"🤖"} onClick={() => onRequestFix?.(error)}>
            fix
          </Button>
        }
      >
        {error.message}
      </Alert>
    </Box>
  );
};
