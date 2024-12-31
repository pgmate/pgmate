import { useEffect, useState } from "react";
import { useMatch } from "react-router-dom";
import { useDynamicQuery } from "hooks/use-query";

const GET_TAGS = `
SELECT DISTINCT UNNEST(tags) AS tag
FROM pgmate.facts
WHERE tags IS NOT NULL
ORDER BY tag;
`;

export const useFactsTags = () => {
  const query = useDynamicQuery("default");
  const match = useMatch("/facts/:tag");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!match) return;
    query(GET_TAGS).then((res) => {
      setTags(res[0].map(($) => $.tag));
    });
  }, [match]);

  return {
    tags: match ? tags : [],
    focus: match?.params.tag,
  };
};
