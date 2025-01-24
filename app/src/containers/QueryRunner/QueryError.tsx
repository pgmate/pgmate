import { useRef, useEffect } from "react";
import { Box, Alert, Button } from "@mui/material";

interface QueryErrorProps {
  error: Error;
  onRequestFix?: (error: Error) => void;
  autoScroll?: boolean; // Optional: Enable or disable auto scroll
  scrollId?: string; // Unique identifier for scrolling
}

export const QueryError: React.FC<QueryErrorProps> = ({
  error,
  onRequestFix,
  autoScroll = true,
  scrollId = crypto.randomUUID(), // Default to a unique random ID
}) => {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (autoScroll && scrollId) {
      const element = document.getElementById(scrollId);
      if (element) {
        timeout = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 250);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [autoScroll, scrollId]);

  return (
    <Box ref={errorRef} id={scrollId} mt={1}>
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
