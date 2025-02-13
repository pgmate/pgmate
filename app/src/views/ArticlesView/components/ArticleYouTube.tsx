import { useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Icon,
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";
import type { Article as ArticleProps } from "../hooks/types";
import { CardTags } from "./CardTags";

interface ArticleYouTubeProps extends ArticleProps {
  display?: "portrait" | "landscape"; // ✅ New optional prop
}

/** Extracts the YouTube video ID from various URL formats */
const extractYouTubeID = (url: string): string | null => {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|embed\/|v\/|shorts\/))([^"&?/ ]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const ArticleYouTube: React.FC<ArticleYouTubeProps> = ({
  display = "portrait",
  ...item
}) => {
  const [open, setOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // 🔹 Force re-render of iframe

  const videoID = extractYouTubeID(item.url);

  if (!videoID) {
    console.error("Invalid YouTube URL:", item.url);
    return null; // Prevent rendering if invalid URL
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
  const embedUrl = `https://www.youtube.com/embed/${videoID}?autoplay=1`;

  const handleOpenPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
    setIframeKey((prev) => prev + 1); // 🔹 Reset iframe when closing
  };

  return (
    <>
      {/* Main Card */}
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardActionArea
          onClick={handleOpenPopup}
          sx={{
            display: "flex",
            flexDirection: display === "landscape" ? "row" : "column",
            alignItems: display === "landscape" ? "center" : "stretch",
          }}
        >
          {/* Cover Image or Embedded Video */}
          {item.cover ? (
            <CardMedia
              component="img"
              image={item.cover}
              alt={item.title}
              sx={{
                width: display === "landscape" ? "50%" : "100%", // ✅ 50% width in landscape
                height: display === "landscape" ? "auto" : 180, // ✅ Auto-height in landscape, fixed in portrait
                aspectRatio: display === "landscape" ? "16/9" : "unset", // ✅ Maintain aspect ratio
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: display === "landscape" ? "50%" : "100%", // ✅ 50% width in landscape
                height: display === "landscape" ? 350 : 180, // ✅ Auto-height in landscape, fixed in portrait
              }}
            >
              <iframe
                key={iframeKey} // 🔹 Force re-render when closing/reopening
                src={embedUrl}
                title={item.title}
                allow="encrypted-media"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  pointerEvents: "none", // Prevents inline play
                }}
              />
            </Box>
          )}

          <CardContent sx={{ flex: 1, flexDirection: "column" }}>
            {/* Article Title */}
            <Typography variant="h6">{item.title}</Typography>

            {/* Excerpt */}
            {item.excerpt && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {item.excerpt}
              </Typography>
            )}
            <Box mt={2}>
              <CardTags sources={item.sources} tags={item.tags} />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>

      {/* Popup Dialog with Embedded Player */}
      <Dialog open={open} onClose={handleClosePopup} maxWidth={"xl"}>
        <DialogContent>
          <Typography variant="h6" mb={1}>
            {item.title}
          </Typography>
          <iframe
            key={iframeKey} // 🔹 Force iframe reload when closing/reopening
            src={embedUrl}
            title={item.title}
            allow="autoplay; encrypted-media"
            width="720px"
            height="405px"
            style={{ border: "none" }}
          />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              component={"a"}
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              fullWidth
              endIcon={<Icon fontSize="small">open_in_new</Icon>}
            >
              Open in YouTube
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
