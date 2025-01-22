import { Box, Stack, ListItemText } from "@mui/material";
import React, { useState, useEffect } from "react";

interface TypingIndicatorProps {}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({}) => {
  const [typingText, setTypingText] = useState("typing");

  useEffect(() => {
    const typingStages = ["typing", "typing.", "typing..", "typing..."];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % typingStages.length;
      setTypingText(typingStages[index]);
    }, 300);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <Box sx={{ display: "block", width: "100%" }}>
      <Stack direction={"row"} flex={1}>
        <Box sx={{ fontSize: 25, p: 2 }}>🤖</Box>
        <Box flex={1}>
          <ListItemText
            primary={<p>{typingText}</p>}
            secondary={`@assistant`}
          />
        </Box>
      </Stack>
    </Box>
  );
};
