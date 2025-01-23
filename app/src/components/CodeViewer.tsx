import Editor from "@monaco-editor/react";
import { IconButton, Tooltip, Box, useTheme } from "@mui/material";
import { Icon } from "components/Icon";

export const CodeViewer = ({
  code,
  language,
  height = 75,
  onMount,
  disableCopy,
  readOnly = true,
  onChange = () => {},
  onRequestRun,
}: {
  code: string;
  language: string;
  height?: number | string;
  onMount?: (editor: any) => void;
  disableCopy?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onRequestRun?: (content: string) => void;
}) => {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      // Replace with notistack
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (readOnly) return;
    if (!value) return;
    onChange(value);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
      }}
    >
      {/* Monaco Editor */}
      <Editor
        language={language}
        value={code}
        theme={monacoTheme}
        height={height}
        options={{
          readOnly,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          padding: {
            top: 10,
          },
          fontSize: 10,
          contextmenu: false,
        }}
        onMount={(editor, monaco) => {
          if (!readOnly && onRequestRun) {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => {
                const selection = editor.getSelection();
                const model = editor.getModel();

                if (selection && model) {
                  const selectedText = model.getValueInRange(selection);
                  const content = selectedText || model.getValue(); // Use selected text or entire content
                  onRequestRun(content);
                }
              }
            );
          }

          onMount?.(editor);
        }}
        onChange={handleEditorChange}
      />

      {/* Copy button */}
      {!disableCopy && (
        <Tooltip title="Copy Code">
          <IconButton
            onClick={handleCopy}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}
          >
            <Icon>content_copy</Icon>
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
