import { useEffect, useCallback, useState } from "react";
import { useDynamicQuery } from "hooks/use-query";

const GET_BATCH = `
SELECT
    f."uuid",
    f."title",
    f."description",
    f."emoticon",
    f."tags",
    f."relevant_links" AS "links"
FROM
    "pgmate"."facts" f
LEFT JOIN
    "pgmate"."facts_likes" fl
ON
    f."uuid" = fl."uuid"
WHERE
    f."uuid" NOT IN (SELECT unnest($1)) -- Exclude UUIDs in $1
    AND (fl."hits" IS NULL OR fl."hits" != -1) -- Exclude rows where hits = -1
    AND (fl."hits" IS NULL OR fl."updated_at" IS NULL OR fl."updated_at" <= now() - interval '10 seconds') -- Exclude hits > 0 updated in the last 30 seconds
ORDER BY
    random()
LIMIT 10;
`;
// const GET_BATCH = `
// SELECT
// "uuid", "title", "description", "emoticon", "tags", "relevant_links" as "links"
// FROM "pgmate"."facts"
// WHERE "uuid" NOT IN $1
// ORDER BY random()
// LIMIT 10;
// `;

const THUMB_UP = `
INSERT INTO "pgmate"."facts_likes" ("uuid", "hits") VALUES ($1, 1)
ON CONFLICT ("uuid") DO UPDATE SET "hits" = "facts_likes"."hits" + 1, updated_at = now();
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
}

export const useRandomFact = () => {
  const query = useDynamicQuery("default");
  const [facts, setFacts] = useState<Fact[]>([]);
  const [read, setRead] = useState<string[]>([
    "11111111-1111-1111-1111-111111111111",
  ]);

  // Load more:
  useEffect(() => {
    if (facts.length > 1) return;

    const load = async () => {
      const sql = GET_BATCH.replace(
        "$1",
        `ARRAY[${read.map(($) => `'${$}'::uuid`).join(",")}]`
      );
      const [batch] = await query(sql);
      if (!batch.length) return;

      const _facts = [...facts];
      batch.forEach(($) => {
        if (!_facts.find(($$) => $$.uuid === $.uuid)) {
          _facts.push($);
        }
      });

      setFacts(_facts);
    };
    load();
  }, [facts]);

  const thumbUp = useCallback(() => {
    const _facts = [...facts];
    const _fact = _facts.shift();
    if (!_fact) return;

    setRead([...read, _fact.uuid]);
    setFacts(_facts);

    query(THUMB_UP, [_fact.uuid]);
  }, [facts, read]);

  const thumbDown = useCallback(() => {
    const _facts = [...facts];
    const _fact = _facts.shift();
    if (!_fact) return;

    setRead([...read, _fact.uuid]);
    setFacts(_facts);

    query(THUMB_DOWN, [_fact.uuid]);
  }, [facts, read]);

  return {
    fact: facts[0],
    thumbUp,
    thumbDown,
  };
};
