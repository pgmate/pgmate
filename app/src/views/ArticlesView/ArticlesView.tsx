import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { PageLayout } from "components/PageLayout";
import { useFilter } from "./hooks/use-filter";
import { useArticles } from "./hooks/use-articles";
import { ArticlesGrid } from "./components/ArticlesGrid";

export const ArticlesView = () => {
  const filter = useFilter();
  const { loading, articles } = useArticles(filter);

  const title =
    filter.type === "source"
      ? filter.sources.find(($) => $.id === filter.value)?.name
      : filter.type === "tag"
      ? filter.tags.find(($) => $.id === filter.value)?.name ||
        `#${filter.value}`
      : null;

  const subtitle =
    filter.type === "source"
      ? filter.sources.find(($) => $.id === filter.value)?.desc
      : filter.type === "tag"
      ? filter.tags.find(($) => $.id === filter.value)?.desc
      : "Stay up to date with stuff";

  return (
    <PageLayout
      title={title || "Articles"}
      subtitle={subtitle}
      disableMargins
      stickyHeader
      tray={
        title && (
          <Button component={Link} to={"/articles"}>
            All articles
          </Button>
        )
      }
    >
      {loading ? "loading..." : <ArticlesGrid articles={articles} />}
    </PageLayout>
  );
};
