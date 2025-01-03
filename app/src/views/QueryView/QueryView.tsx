import Editor, { Monaco } from "@monaco-editor/react";
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, ButtonGroup, Box, Alert, useTheme } from "@mui/material";
import { useDynamicQueries } from "hooks/use-query";
import { useConnection } from "hooks/use-connections";
import { SplitPane } from "components/SplitPane";
import { SizedBox } from "components/SizedBox";
import { ResultsTable } from "./containers/ResultsTable";
import { ResultsEmpty } from "./containers/ResultsEmpty";
import { splitIntoStatements1 as splitIntoStatements } from "./utils";

const SQL = `
SELECT * FROM now();
SELECT 'marco' AS name;
SELECT 1 + 1 AS sum;

-- error here
select foo from hoho;

SELECT
*
FROM
pgmate.migrations;

create table
if not exists
"users" (name text primary key, age int);

SELECT
*
FROM
pgmate.facts;

-- Simple SQL function
CREATE OR REPLACE FUNCTION add_one(num integer)
RETURNS integer AS $$
BEGIN
  RETURN num + 1;
END;
$$ LANGUAGE plpgsql;

-- Simple SQL DO block
DO $$
BEGIN
  RAISE NOTICE 'Hello from DO block';
END;
$$;

-- Begin/Rollback transaction
BEGIN;
INSERT INTO pgmate.settings (key, value)
VALUES ('foo', '"bar"');
ROLLBACK;

-- Begin/Commit transaction
BEGIN;
INSERT INTO pgmate.settings (key, value)
VALUES ('foo', '"bar"')
ON CONFLICT ON CONSTRAINT settings_pkey
DO UPDATE SET value = EXCLUDED.value
RETURNING *;
COMMIT;
`;

interface QueryResult {
  rows: any[] | null;
  error: any | null;
}

export const QueryView = () => {
  const theme = useTheme();
  const params = useParams<{ conn: string; db: string }>();
  const conn = useConnection(params.conn!, params.db!);
  const query = useDynamicQueries(conn!, { disableAnalyze: false });
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";
  const [editorContent, setEditorContent] = useState(
    import.meta.env.VITE_NODE_ENV === "development" ? SQL : ""
  );
  // const [editorContent, setEditorContent] = useState("");
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const editorRef = useRef<any>(null);
  const editorSizeRef = useRef<{ width: number; height: number } | null>(null);

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor; // Assign editor instance to the ref

    // Add keybinding for Cmd+Enter or Ctrl+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const selection = editor.getSelection();
      const model = editor.getModel();

      if (selection && model.getValueInRange(selection).trim()) {
        runSelection();
      } else {
        runStatement(monaco);
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

  const runSelection = () => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    const selection = editor?.getSelection();

    if (!model || !selection) {
      console.log("Model or selection is not defined.");
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
    const statements = splitIntoStatements(fullContent);

    console.log(statements);
    // execStatements(statements);
  };

  const runStatement = (monaco: Monaco) => {
    console.log("Running Statement", conn?.name, conn?.database);
    const editor = editorRef.current;
    const model = editor?.getModel();
    const position = editor?.getPosition();

    if (!model || !position) {
      console.log("Editor or position is not defined.");
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
      console.log("empty line? what do we do???");
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
    const range = new monaco.Range(
      startLine + 1,
      1,
      endLine + 1,
      lines[endLine].length + 1
    );

    editor.setSelection(range);
    editor.revealRange(range); // Ensure the range is visible in the editor

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
        queries.forEach((item: any) => {
          console.log(item.query.statement);
          if (item.rows) {
            console.table(item.rows);
          }
          if (item.error) {
            console.error(item.error.message);
          }
        });
      }
    );
  };

  const saveToDatabase = async () => {
    console.log("Saving Content to Database:", editorContent);
  };

  const handlePaneSizeChange = (size: { width: number; height: number }) => {
    editorRef.current?.layout(size);
    editorSizeRef.current = size;
  };

  // useEffect(() => {
  //   execStatements(["select * from pgmate.migrations where 1 = 2"]);
  // }, []);

  // if (!conn?.name) return;

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
                  onChange={(value) => {
                    setEditorContent(value || "");
                  }}
                />
              )
            }
          </SizedBox>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1}
        >
          <ButtonGroup variant="contained" size="small">
            <Button onClick={runSelection}>Run Selection</Button>
            <Button onClick={runAll}>Run All</Button>
            <Button onClick={() => runStatement(editorRef.current.monaco)}>
              Run Statement
            </Button>
          </ButtonGroup>
          <Button variant="outlined" onClick={saveToDatabase} size="small">
            Save Query
          </Button>
        </Box>
      </Box>
      {showResults && (
        <Box>
          {results && results.length === 1 && (
            <Box>
              {results[0].error && (
                <Alert severity="error">{results[0].error.message}</Alert>
              )}
              {results[0].rows && results[0].rows.length > 0 ? (
                <ResultsTable rows={results[0].rows} />
              ) : (
                <ResultsEmpty data={results[0]} />
              )}
            </Box>
          )}

          {results && results.length > 1 && <Box>Multiple results</Box>}
        </Box>
      )}
    </SplitPane>
  );
};
