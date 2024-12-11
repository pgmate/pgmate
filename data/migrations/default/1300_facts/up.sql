CREATE TABLE IF NOT EXISTS "pgmate"."facts" (
    "uuid" UUID PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoticon" TEXT,
    "publish_date" DATE,
    "tags" TEXT[],
    "relevant_links" TEXT[],
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "pgmate"."facts_likes" (
    "uuid" UUID PRIMARY KEY REFERENCES "pgmate"."facts"("uuid") ON DELETE CASCADE,
    "hits" INT DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);