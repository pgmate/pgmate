--DROP SCHEMA IF EXISTS "pgmate" CASCADE;

CREATE SCHEMA IF NOT EXISTS "pgmate";

--
-- Public interface table for exposing Postgres functions through Hasura.
--
CREATE TABLE IF NOT EXISTS "pgmate"."migrations" (
  "target" TEXT NOT NULL,
  "id" INTEGER,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("target", "id")
);
