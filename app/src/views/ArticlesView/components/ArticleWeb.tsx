import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
} from "@mui/material";
import type { Article as ArticleProps } from "../hooks/types";
import { useCallback } from "react";
import { CardTags } from "./CardTags";

interface ArticleWebProps extends ArticleProps {
  display?: "portrait" | "landscape"; // ✅ New optional prop
}

export const ArticleWeb: React.FC<ArticleWebProps> = ({
  display = "portrait",
  ...item
}) => {
  const openArticle = useCallback(() => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  }, [item.url]);

  return (
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardActionArea
        onClick={openArticle}
        sx={{
          display: "flex",
          flexDirection: display === "landscape" ? "row" : "column",
          alignItems: display === "landscape" ? "center" : "stretch",
        }}
      >
        {/* Cover Image */}
        {item.cover && (
          <CardMedia
            component="img"
            image={item.cover}
            alt={item.title}
            sx={{
              width: display === "landscape" ? "33.33%" : "100%", // ✅ Full width in portrait, 1/3 in landscape
              height: display === "landscape" ? 250 : 180, // ✅ Restored portrait mode behavior
              objectFit: "cover",
              flexShrink: 0, // ✅ Prevents image from shrinking
            }}
          />
        )}

        <CardContent sx={{ flex: 1 }}>
          {/* Article Title */}
          <Typography variant="h6">{item.title}</Typography>

          {/* Excerpt */}
          {item.excerpt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {item.excerpt}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <CardTags sources={item.sources} tags={item.tags} />
        </CardActions>
      </CardActionArea>
    </Card>
  );
};
