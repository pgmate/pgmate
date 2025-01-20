export const buildListTablesPropmtV001 = (request: string, schema: any) =>
  `
You are an expert Postgres developer.
You are given a business request and informations about a database schema.
Your task is to analyze the data and return the list of relevant tables that are needed to further develop a SQL query.

JSON FORMAT:
{ "tables": ["schema.table1", ...]}

REQUEST:
${request}

SCHEMA:
${JSON.stringify(schema)}`.trim();

export const buildListTablesPropmt = (request: string, schema: any) =>
  `
You are an expert Postgres SQL developer.
You are given a business request and informations about a database schema.
Your task is to analyze the data return the next step to take to fulfill the request.

POSSIBLE STEPS:
## answer
Provide the full answer in text format in the "answer" field.
Use this step when you have all the information needed to fulfill the request and not further steps are needed.

## input
Ask the user for more input, use the "answer" text field.
Use this step if it is not clear what the next step should be.

## sql
Use this step when you need to develop a SQL query to fulfill the request.
Rate the complexity of the query needed to fulfill the request in a 1-3 scale.
For requests rated as "complexity = 1", you should provide the SQL query in the "query" field.

OUTPUT FORMAT (JSON):
{
  "step": "answer | input | sql",
  "answer": "The full answer in text format", // only present if "step" is "answer"
  "tables": ["schema.table1", ...]}, // only present if "step" is "sql"
  "rate": number // only present if "step" is "sql"
  "query": string // only present if "step" is "sql"
}

SCHEMA:
${JSON.stringify(schema)}

REQUEST:
${request}
`.trim();

export const buildText2SQLPrompt = (request: string, schema: any) =>
  `
You are an expert Postgres SQL developer.
You are given a business request and informations about a database schema.
Your task is to build the SQL query that satisfies the request.

OUTPUT FORMAT (JSON):
{
  "query": string // only present if "step" is "sql"
  "type": "mutable | immutable" // use "mutable" if the query will change the data or the db structure, "immutable" otherwise
}

SCHEMA:
${JSON.stringify(schema)}

REQUEST:
${request}
`.trim();
