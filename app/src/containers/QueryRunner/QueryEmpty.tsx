import { useRef, useEffect } from "react";
import { Box, Alert } from "@mui/material";

interface QueryEmptyProps {
  autoScroll?: boolean; // Optional: Enable or disable auto scroll
  scrollId?: string; // Unique identifier for scrolling
}

export const QueryEmpty: React.FC<QueryEmptyProps> = ({
  autoScroll = true,
  scrollId = crypto.randomUUID(), // Default to a unique random ID
}) => {
  const emptyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (autoScroll && scrollId) {
      const element = document.getElementById(scrollId);
      if (element) {
        timeout = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 250);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [autoScroll, scrollId]);

  return (
    <Box ref={emptyRef} id={scrollId} mt={1}>
      <Alert severity="info">No results</Alert>
    </Box>
  );
};
