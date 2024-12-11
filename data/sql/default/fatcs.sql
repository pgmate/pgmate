-- To retrieve unique tags from the pgmate.facts table, use the following query:
-- Replace $1 with the desired tag.
SELECT DISTINCT UNNEST(tags) AS unique_tag
FROM pgmate.facts
WHERE tags IS NOT NULL
ORDER BY unique_tag;

-- To filter rows by one or more tags, use the ANY or && operator (depending on your filtering needs).
-- Replace $1 with an array of tags, e.g., '{tag1, tag2}'.
SELECT *
FROM pgmate.facts
WHERE $1 = ANY(tags);

-- Replace $1 with an array of tags that should all be present in the row, e.g., '{tag1, tag2}'.
SELECT *
FROM pgmate.facts
WHERE tags && $1;