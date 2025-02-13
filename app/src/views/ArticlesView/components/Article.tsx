import { ArticleWeb } from "./ArticleWeb";
import { ArticleYouTube } from "./ArticleYouTube";
import type { Article as ArticleType } from "../hooks/types";

interface ArticleProps extends ArticleType {
  display?: "portrait" | "landscape"; // ✅ New optional prop
}

const mediaMap: Record<string, React.FC<ArticleProps>> = {
  youtube: ArticleYouTube,
};

export const Article: React.FC<ArticleProps> = (item) => {
  const RenderCmp = mediaMap[item.media] || ArticleWeb;
  return <RenderCmp {...item} />;
};
