CREATE TABLE IF NOT EXISTS "pgmate"."llm_cache" (
    "hash" TEXT PRIMARY KEY,
    "options" JSONB NOT NULL,
    "request" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "pgmate"."llm_cache" IS 
'Stores LLM requests so to limit the number of requests to the LLM API';
