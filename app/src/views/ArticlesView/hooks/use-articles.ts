import { useEffect, useState } from "react";
import { useDynamicQuery } from "hooks/use-query";
import { Article, Filter } from "./types";

export const useArticles = (filter: Filter) => {
  const query = useDynamicQuery("default");
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (filter.loading) return;

    const sql = [
      "select * from pgmate.articles",
      filter.type ? `WHERE  '${filter.value}' = ANY(${filter.type}s)` : "",
      "order by cdate desc",
    ].join(" ");

    // console.log(filter, sql);

    query(sql, [])
      .then(([rows]: [Article[], any]) => {
        if (!rows) {
          throw new Error("query error");
        }
        setLoading(false);
        setArticles(rows);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  }, [filter.loading, filter.value]);

  return {
    loading,
    articles,
  };
};
