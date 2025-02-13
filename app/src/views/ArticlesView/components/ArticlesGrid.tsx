import type { Article } from "../hooks/types";
import { Article as ArticleCard } from "./Article";
import Grid from "@mui/material/Grid2";

interface ArticlesGridProps {
  articles: Article[];
}

export const ArticlesGrid: React.FC<ArticlesGridProps> = ({ articles }) => {
  return (
    <Grid container spacing={2}>
      {/* First item: Full width if at least 4 articles exist */}
      {articles.length >= 4 && (
        <Grid size={12}>
          <ArticleCard {...articles[0]} display="landscape" />
        </Grid>
      )}

      {/* Second & Third items: Two columns if at least 6 articles exist */}
      {articles.length >= 6 &&
        articles.slice(1, 3).map((article) => (
          <Grid key={article.id} size={{ xs: 12, md: 6 }}>
            <ArticleCard {...article} />
          </Grid>
        ))}

      {/* Remaining articles */}
      {articles
        .slice(articles.length >= 6 ? 3 : articles.length >= 4 ? 1 : 0)
        .map((article) => (
          <Grid key={article.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <ArticleCard {...article} />
          </Grid>
        ))}
    </Grid>
  );
};
