import { Box, Chip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useFactsTags } from "./hooks/use-facts-tags";

export const FactsTags = () => {
  const { tags, focus } = useFactsTags();
  if (!tags.length) return null;

  return (
    <Box pl={2}>
      <Typography variant="h3" mt={4} mb={2}>
        Topics:
      </Typography>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size={"small"}
          component={Link}
          to={`/facts/${tag}`}
          sx={{ cursor: "pointer", mr: 1, mb: 1 }}
          color={tag === focus ? "primary" : "default"}
        />
      ))}
    </Box>
  );
};
