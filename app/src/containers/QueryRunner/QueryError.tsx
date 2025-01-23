import { Box, Alert, Button } from "@mui/material";

interface QueryErrorProps {
  error: Error;
  onRequestFix?: (error: Error) => void;
}

export const QueryError: React.FC<QueryErrorProps> = ({
  error,
  onRequestFix,
}) => (
  <Box mt={1}>
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
