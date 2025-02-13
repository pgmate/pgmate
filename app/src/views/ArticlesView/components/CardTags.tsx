import { Chip, Stack } from "@mui/material";
import { Link } from "react-router-dom";

interface CardTagsProps {
  sources?: string[];
  tags?: string[];
}

export const CardTags: React.FC<CardTagsProps> = ({ sources, tags }) => {
  return (
    <Stack spacing={1} direction={"row"}>
      {sources?.map((value) => (
        <Chip
          label={`@${value}`}
          size={"small"}
          component={Link}
          to={`/articles/${value}`}
          onClick={(e) => e.stopPropagation()}
        />
      ))}
      {tags?.map((value) => (
        <Chip
          label={`#${value}`}
          size={"small"}
          component={Link}
          to={`/articles/${value}`}
          onClick={(e) => e.stopPropagation()}
        />
      ))}
    </Stack>
  );
};
