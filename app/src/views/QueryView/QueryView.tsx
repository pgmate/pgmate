import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Button, ButtonGroup, Box, useTheme } from "@mui/material";
import { PageLayout } from "../../components/PageLayout";

export const QueryView = () => {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";
  const [editorContent, setEditorContent] = useState("SELECT * FROM users;");

  // Ref to store the editor instance
  let editorRef: any = null;

  const handleEditorMount = (editor: any) => {
    editorRef = editor;
  };

  const runSelection = () => {
    const selectedText = editorRef
      ?.getModel()
      ?.getValueInRange(editorRef.getSelection());
    console.log("Run Selection:", selectedText);
    // Handle the execution of the selected query (selectedText)
  };

  const runAll = () => {
    console.log("Run All:", editorContent);
    // Handle the execution of the full query (editorContent)
  };

  const saveToDatabase = async () => {
    console.log("Saving Content to Database:", editorContent);
    // Handle saving to the database
    // Use your API logic to save `editorContent` to the database
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
