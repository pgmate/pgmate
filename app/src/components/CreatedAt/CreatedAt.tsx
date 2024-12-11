import { Typography, TypographyProps } from "@mui/material";
import { formatDate } from "./format-date";
import React from "react";

interface CreatedAtProps extends TypographyProps {
  date: string;
}

// Use forwardRef to make the component ref-forwarding
export const CreatedAt = React.forwardRef<HTMLSpanElement, CreatedAtProps>(
  ({ date, sx = {}, ...props }, ref) => {
    return (
      <Typography
        component="span"
        ref={ref} // Forward the ref to Typography
        sx={{ fontSize: 12, fontWeight: "bold", ...sx }}
        color="text.secondary"
        gutterBottom
        {...props}
      >
        {formatDate(date)}
      </Typography>
    );
  }
);

// Set a display name for better debugging
CreatedAt.displayName = "CreatedAt";
