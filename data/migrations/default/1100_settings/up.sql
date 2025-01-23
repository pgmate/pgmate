
--
-- Public interface table for exposing Postgres functions through Hasura.
--
CREATE TABLE IF NOT EXISTS "pgmate"."settings" (
  "key" TEXT PRIMARY KEY,
  "value" JSONB
);

COMMENT ON TABLE "pgmate"."settings" IS
'Stores key-value pairs for application settings.';