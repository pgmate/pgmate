import Editor, { Monaco } from "@monaco-editor/react";
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, ButtonGroup, Box, useTheme } from "@mui/material";
import { PageLayout } from "../../components/PageLayout";
import { useDynamicQuery } from "../../hooks/use-query";

export const QueryView = () => {
  const theme = useTheme();
  const { conn } = useParams<{ conn: string }>();
  const query = useDynamicQuery(conn!);
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";
  const [editorContent, setEditorContent] = useState(
    "SELECT * FROM now();\nSELECT 'marco' AS name;\nSELECT 1 + 1 AS sum;"
  );

  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]); // Store editor decorations

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
  };

  const runSelection = () => {
    const selectedText = editorRef.current
      ?.getModel()
      ?.getValueInRange(editorRef.current.getSelection());
    console.log("Run Selection:", selectedText);
    query(selectedText, []).then((res) => {
      console.table(res[0]);
    });
  };

  const runAll = () => {
    console.log("Run All:", editorContent);
    query(editorContent, []).then((res) => {
      console.table(res[0]);
    });
  };

  const runStatement = (monaco: Monaco) => {
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

    // Move upwards to find the start of the SQL statement
    while (startLine > 0 && !lines[startLine].trim().endsWith(";")) {
      startLine--;
    }

    // Move downwards to find the end of the SQL statement
    while (endLine < lines.length - 1 && !lines[endLine].trim().endsWith(";")) {
      endLine++;
    }

    // Extract the statement
    const statement = lines
      .slice(startLine, endLine + 1)
      .join("\n")
      .trim();

    console.log("Run Statement:", statement);

    // Highlight the full statement by selecting it
    const range = new monaco.Range(
      startLine + 1,
      1,
      endLine + 1,
      lines[endLine].length + 1
    );

    editor.setSelection(range);
    editor.revealRange(range); // Ensure the range is visible in the editor

    // Handle query execution
    query(statement, []).then((res) => {
      console.table(res[0]);
    });
  };

  const saveToDatabase = async () => {
    console.log("Saving Content to Database:", editorContent);
  };

  return (
    <PageLayout title="Query" subtitle="Query your database">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <ButtonGroup variant="contained">
          <Button onClick={runSelection}>Run Selection</Button>
          <Button onClick={runAll}>Run All</Button>
          <Button onClick={() => runStatement(editorRef.current.monaco)}>
            Run Statement
          </Button>
        </ButtonGroup>
        <Button variant="outlined" onClick={saveToDatabase}>
          Save Query
        </Button>
      </Box>
      <Editor
        language={"sql"}
        value={editorContent}
        theme={monacoTheme}
        height={400}
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
    </PageLayout>
  );
};
