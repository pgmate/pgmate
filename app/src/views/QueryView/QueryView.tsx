import Editor, { Monaco } from "@monaco-editor/react";
import { useState, useRef } from "react";
import { Box, Alert, useTheme } from "@mui/material";
import { usePubSub } from "hooks/use-pubsub";
import { useDynamicQueries } from "hooks/use-query";
import { useSubscribe } from "hooks/use-pubsub";
import { useStorage } from "hooks/use-storage";
import { SplitPane } from "components/SplitPane";
import { SizedBox } from "components/SizedBox";
import { ResultsTable } from "./containers/ResultsTable";
import { ResultsEmpty } from "./containers/ResultsEmpty";
// import { splitIntoStatements1 as splitIntoStatements } from "./utils";

const SQL = "";

// const SQL = `
// SELECT * FROM now();
// SELECT 'marco' AS name;
// SELECT 1 + 1 AS sum;

// SELECT "city_id", "city", "country_id", "last_update"
// FROM "public"."city" limit 5;

// SELECT "city_id", "city", "country_id", "last_update"
// FROM "public"."city" limit 15;
// `;

// This dummy SQL is used to test the query splitter and identify the correct statements
// based on the cursor position.
// const SQL = `
// SELECT * FROM now();
// SELECT 'marco' AS name;
// SELECT 1 + 1 AS sum;

// -- error here
// select foo from hoho;

// SELECT
// *
// FROM
// pgmate.migrations;

// create table
// if not exists
// "users" (name text primary key, age int);

// SELECT
// *
// FROM
// pgmate.facts;

// -- Simple SQL function
// CREATE OR REPLACE FUNCTION add_one(num integer)
// RETURNS integer AS $$
// BEGIN
//   RETURN num + 1;
// END;
// $$ LANGUAGE plpgsql;

// -- Simple SQL DO block
// DO $$
// BEGIN
//   RAISE NOTICE 'Hello from DO block';
// END;
// $$;

// -- Begin/Rollback transaction
// BEGIN;
// INSERT INTO pgmate.settings (key, value)
// VALUES ('foo', '"bar"');
// ROLLBACK;

// -- Begin/Commit transaction
// BEGIN;
// INSERT INTO pgmate.settings (key, value)
// VALUES ('foo', '"bar"')
// ON CONFLICT ON CONSTRAINT settings_pkey
// DO UPDATE SET value = EXCLUDED.value
// RETURNING *;
// COMMIT;
// `;

interface QueryResult {
  rows: any[] | null;
  error: any | null;
  meta?: { [key: number]: any };
}

export const QueryView = ({ conn }: { conn: Connection }) => {
  const bus = usePubSub();
  const theme = useTheme();
  const storage = useStorage();
  const storageKey = `sql.${conn.name}.${conn.database}`;

  const query = useDynamicQueries(conn!, { disableAnalyze: false });
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";

  const [editorContent, setEditorContent] = useState(
    storage.getItem(storageKey) ||
      (import.meta.env.VITE_NODE_ENV === "development" ? SQL : "")
  );

  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<any>(null);
  const editorSizeRef = useRef<{ width: number; height: number } | null>(null);

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor; // Assign editor instance to the ref
    monacoRef.current = monaco; // Assign monaco instance to the ref

    // Add keybinding for Cmd+Enter or Ctrl+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selection = editor.getSelection();
      const model = editor.getModel();

      if (selection && model.getValueInRange(selection).trim()) {
        runSelection();
      } else {
        runStatement();
      }
    });

    // Add keybinding for Alt+Cmd+Enter or Alt+Ctrl+Enter (Run All Statements)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.Enter,
      () => {
        runAll();
      }
    );

    // Set initial editor size
    setTimeout(() => {
      editor.layout(editorSizeRef.current);
      editor.focus();
    }, 10);
  };

  const handleEditorChange = (value: string | undefined) => {
    // Persist content to localStorage
    if (value !== undefined) {
      // localStorage.setItem("editorContent", value);
      console.log("Editor Content:", value);
      setEditorContent(value || "");
      storage.setItem(storageKey, value);
    }
  };

  const runSelection = () => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    const selection = editor?.getSelection();

    if (!model || !selection) {
      console.error("Model or selection is not defined.");
      return;
    }

    const selectedText = model.getValueInRange(selection);
    execStatements([selectedText]);
  };

  const runAll = () => {
    const editor = editorRef.current;
    const model = editor?.getModel();

    if (!model) {
      console.log("Model is not defined.");
      return;
    }

    const fullContent = model.getValue();
    execStatements([fullContent]);
  };

  const runStatement = () => {
    console.log("Running Statement", conn?.name, conn?.database);
    const editor = editorRef.current;
    const model = editor?.getModel();
    const position = editor?.getPosition();

    if (!model || !position) {
      console.error("Editor or position is not defined.");
      return;
    }

    const fullContent = model.getValue();
    const lines = fullContent.split("\n");

    const cursorLine = position.lineNumber - 1; // Adjust for zero-based index
    let startLine = cursorLine;
    let endLine = cursorLine;

    if (
      lines[startLine].trim().startsWith("--") ||
      lines[startLine].trim() == ""
    ) {
      alert("Please place the cursor on a valid SQL statement");
      return;
    }

    // Find the beginning of the statmement
    while (startLine > 0) {
      const currentLine = lines[startLine].trim();

      // Stop at the first empty line or after encountering a line ending with ';'
      if (
        currentLine.trim() === "" ||
        currentLine.trim().endsWith(";") ||
        currentLine.trim().startsWith("--")
      ) {
        if (startLine !== endLine) {
          startLine++; // Move to the line after the empty line or semicolon
          break;
        }
      }
      startLine--;
    }

    // Find the end of the statment
    while (endLine < lines.length - 1) {
      const currentLine = lines[endLine].trim();

      // Stop at the first empty line or after encountering a line ending with ';'
      if (currentLine === "" || currentLine.endsWith(";")) {
        break;
      }
      endLine++;
    }

    // Extract the statement
    const statement = lines
      .slice(startLine, endLine + 1)
      .join("\n")
      .trim();

    if (!statement) {
      console.log("@failed to identify a statement");
      runAll();
      return;
    }

    // Highlight the full statement by selecting it
    if (monacoRef.current) {
      const range = new monacoRef.current.Range(
        startLine + 1,
        1,
        endLine + 1,
        lines[endLine].length + 1
      );

      editor.setSelection(range);
      editor.revealRange(range); // Ensure the range is visible in the editor
    }

    execStatements([statement]);
  };

  const execStatements = (statements: string[]) => {
    setResults(null);
    console.log("Executing Statements:", statements);
    query(statements.map((statement) => ({ statement, variables: [] }))).then(
      ([queries]) => {
        console.log("Queries:", queries);
        setResults(queries);
        setShowResults(true);

        if (
          [
            "UPDATE",
            "DELETE",
            "INSERT",
            "MERGE",
            "CREATE",
            "ALTER",
            "DROP",
            "TRUNCATE",
            "RENAME",
            "COMMIT",
            "ROLLBACK",
            "GRANT",
            "REVOKE",
            "SET",
            "EXECUTE",
          ].some((keyword) =>
            statements.join(" ").toUpperCase().includes(keyword)
          )
        ) {
          bus.emit("dbinfo:refresh");
        }
        // queries.forEach((item: any) => {
        //   console.log(item.query.statement);
        //   if (item.rows) {
        //     console.table(item.rows);
        //   }
        //   if (item.error) {
        //     console.error(item.error.message);
        //   }
        // });
      }
    );
  };

  // const saveToDatabase = async () => {
  //   console.log("Saving Content to Database:", editorContent);
  // };

  const handlePaneSizeChange = (size: { width: number; height: number }) => {
    editorRef.current?.layout(size);
    editorSizeRef.current = size;
  };

  useSubscribe("QueryView.run", () => {
    runSelection();
  });

  return (
    <SplitPane storageKey="query" direction="vertical">
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <SizedBox onSizeChange={handlePaneSizeChange}>
            {() =>
              conn?.name && (
                <Editor
                  language={"sql"}
                  value={editorContent}
                  theme={monacoTheme}
                  height={100}
                  options={{
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    minimap: { enabled: false },
                    padding: {
                      top: 10,
                    },
                    fontSize: 10,
                    contextmenu: false,
                  }}
                  onMount={handleEditorMount}
                  onChange={handleEditorChange}
                />
              )
            }
          </SizedBox>
        </Box>
      </Box>
      {showResults && (
        <SizedBox>
          {({ height }) => {
            if (!height) return null;
            return (
              <Box height={height}>
                {results && results[0].error && (
                  <Alert severity="error">{results[0].error.message}</Alert>
                )}
                {results && results[0].rows && results[0].rows.length > 0 && (
                  <ResultsTable rows={results[0].rows} />
                )}
                {results &&
                  !results[0].rows &&
                  results[0].meta &&
                  (() => {
                    const keys = Object.keys(results[0].meta);
                    const lastKey = keys.length > 0 ? keys.pop() : undefined;

                    return lastKey !== undefined ? (
                      results[0].meta[Number(lastKey)].rows.length > 0 ? (
                        <ResultsTable
                          rows={results[0].meta[Number(lastKey)].rows}
                        />
                      ) : (
                        <ResultsEmpty data={results[0].meta[Number(lastKey)]} />
                      )
                    ) : null;
                  })()}
                {results && results[0].rows && results[0].rows.length === 0 && (
                  <ResultsEmpty data={results[0]} />
                )}
              </Box>
            );
          }}
        </SizedBox>
      )}
    </SplitPane>
  );
};
