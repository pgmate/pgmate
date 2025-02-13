import { useArticles } from "views/ArticlesView/hooks/use-articles";
import { ArticlesGrid } from "views/ArticlesView/components/ArticlesGrid";

export const ArticlesWall = () => {
  const { loading, articles } = useArticles({
    loading: false,
    tags: [],
    sources: [],
  });

  return loading ? (
    "loading..."
  ) : (
    <ArticlesGrid articles={articles.slice(0, 6)} />
  );
};
