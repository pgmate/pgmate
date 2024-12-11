import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Stack,
  IconButton,
  Icon,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useRandomFact } from "./hooks/use-random-fact";

export const DidYouKnow = () => {
  const { fact, thumbUp, thumbDown } = useRandomFact();

  if (!fact) return null;

  return (
    <Stack spacing={2} px={2} mt={2}>
      <Alert severity="info" icon={fact.emoticon}>
        <AlertTitle>{fact.title}</AlertTitle>
        <Box mb={1}>{fact.description}</Box>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            {fact.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                component={Link}
                to={`/facts/${encodeURIComponent(tag)}`}
                sx={{ cursor: "pointer" }}
                size="small"
              />
            ))}
          </Stack>
          <Stack direction={"row"}>
            {fact.links.length && (
              <>
                <IconButton component={Link} to={fact.links[0]} target="_blank">
                  <Icon sx={{ fontSize: 20 }}>ios_share</Icon>
                </IconButton>
                <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
              </>
            )}
            <IconButton onClick={thumbUp}>
              <Icon sx={{ fontSize: 20 }}>thumb_up</Icon>
            </IconButton>
            <IconButton onClick={thumbDown}>
              <Icon sx={{ fontSize: 20 }}>thumb_down</Icon>
            </IconButton>
          </Stack>
        </Stack>
      </Alert>
    </Stack>
  );
};
