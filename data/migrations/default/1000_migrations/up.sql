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

COMMENT ON TABLE "pgmate"."migrations" IS 
'Tracks applied SQL migrations in the database. 
Each migration belongs to a "target" (e.g., "default", "staging", "production"). 
Targets represent logical groupings, such as databases, schemas, or custom identifiers. 
Supports multiple migrations per target for version control.';

COMMENT ON COLUMN "pgmate"."migrations"."target" IS 'Could represent a database, schema, or custom logical identifier';