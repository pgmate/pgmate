CREATE TABLE IF NOT EXISTS "pgmate"."articles_sources" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "desc" TEXT DEFAULT NULL,
  "url" TEXT DEFAULT NULL,
  "cover" TEXT DEFAULT NULL
);

COMMENT ON TABLE "pgmate"."articles_sources" IS 
'Stores information about article''s source.';

CREATE TABLE IF NOT EXISTS "pgmate"."articles_tags" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "desc" TEXT DEFAULT NULL,
  "cover" TEXT DEFAULT NULL
);

COMMENT ON TABLE "pgmate"."articles_tags" IS 
'Stores information about tags used to classify articles.';

CREATE TABLE IF NOT EXISTS "pgmate"."articles" (
  "id" TEXT PRIMARY KEY,
  "cdate" DATE NOT NULL,
  "media" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "cover" TEXT DEFAULT NULL,
  "excerpt" TEXT DEFAULT NULL,
  "sources" TEXT[] DEFAULT NULL,
  "tags" TEXT[] DEFAULT NULL
);