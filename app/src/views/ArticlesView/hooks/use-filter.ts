import { useParams } from "react-router-dom";
import { useQueries } from "hooks/use-query";
import type { Filter } from "./types";

export const useFilter = (): Filter => {
  const { sub } = useParams();
  const { data } = useQueries("default", [
    {
      statement: "select * from pgmate.articles_tags",
      variables: [],
    },
    {
      statement: "select * from pgmate.articles_sources",
      variables: [],
    },
  ]);

  const tags = data ? data[0].rows : [];
  const sources = data ? data[1].rows : [];

  const isSource = sources.find(($) => $.id === sub);

  return {
    loading: !data,
    type: sub ? (isSource ? "source" : "tag") : undefined,
    value: sub,
    tags,
    sources,
  };
};
