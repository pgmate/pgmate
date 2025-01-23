
--
-- Public interface table for exposing Postgres functions through Hasura.
--
CREATE TABLE IF NOT EXISTS "pgmate"."connections" (
  "name" TEXT PRIMARY KEY,
  "desc" TEXT,
  "conn" TEXT NOT NULL,
  "ssl" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "pgmate"."connections" IS 
'Stores connection details for Postgres databases. 
The "conn" column contains an encrypted postgres connection string.';

COMMENT ON COLUMN "pgmate"."connections"."conn" IS 'Encrypted by the backend';