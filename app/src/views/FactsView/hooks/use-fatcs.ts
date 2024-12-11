import { useEffect, useState, useCallback } from "react";
import { useDynamicQuery } from "../../../hooks/use-query";

const GET_TAGS = `
SELECT
    f."uuid",
    f."title",
    f."description",
    f."emoticon",
    f."tags",
    f."relevant_links" AS "links",
    COALESCE(fl."hits", 0) AS "hits"
FROM
    "pgmate"."facts" f
LEFT JOIN
    "pgmate"."facts_likes" fl
ON
    f."uuid" = fl."uuid"
WHERE
    $1 = ANY(f."tags") AND f."title" > $2
ORDER BY
    f."title" ASC
LIMIT 3;
`;

const THUMB_UP = `
INSERT INTO "pgmate"."facts_likes" ("uuid", "hits") 
VALUES ($1, 1)
ON CONFLICT ("uuid") 
DO UPDATE SET 
    "hits" = CASE 
                 WHEN "facts_likes"."hits" = -1 THEN 1 
                 ELSE "facts_likes"."hits" + 1 
             END,
    "updated_at" = now();
`;

const THUMB_DOWN = `
INSERT INTO "pgmate"."facts_likes" ("uuid", "hits") VALUES ($1, -1)
ON CONFLICT ("uuid") DO UPDATE SET "hits" = -1, updated_at = now();
`;

interface Fact {
  uuid: string;
  title: string;
  description: string;
  emoticon: string;
  tags: string[];
  links: string[];
  hits: number;
}

export const useFacts = (tag: string) => {
  const query = useDynamicQuery("default");
  const [items, setItems] = useState<Fact[]>([]);

  const loadMore = useCallback(
    (_items = items) => {
      query(GET_TAGS, [
        tag,
        _items.length ? _items[_items.length - 1].title : "",
      ]).then((res) => {
        // console.log("@curr", _items);
        setItems([..._items, ...res[0]]);
      });
    },
    [tag, items]
  );

  useEffect(() => {
    // console.log("@reload for", tag);
    setItems([]);
    loadMore([]);
  }, [tag]);

  const thumbUp = useCallback(
    (fact: Fact) => {
      query(THUMB_UP, [fact.uuid]);
      setItems(
        items.map((item) =>
          item.uuid === fact.uuid ? { ...item, hits: 1 } : item
        )
      );
    },
    [query, items]
  );

  const thumbDown = useCallback(
    (fact: Fact) => {
      query(THUMB_DOWN, [fact.uuid]);
      setItems(
        items.map((item) =>
          item.uuid === fact.uuid ? { ...item, hits: -1 } : item
        )
      );
    },
    [query, items]
  );

  return {
    items,
    loadMore,
    thumbUp,
    thumbDown,
  };
};
