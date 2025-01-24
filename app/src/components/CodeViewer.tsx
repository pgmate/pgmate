import { useRef } from "react";
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
  autoFocus = false,
  autoScrollIntoView = false,
}: {
  code: string;
  language: string;
  height?: number | string;
  onMount?: (editor: any) => void;
  disableCopy?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onRequestRun?: (content: string) => void;
  autoFocus?: boolean; // Gain focus on mount
  autoScrollIntoView?: boolean; // Scroll into view when focused
}) => {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";
  const editorRef = useRef<HTMLDivElement | null>(null);

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
      ref={editorRef}
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
          // Enable scroll when editor gains focus
          editor.onDidFocusEditorWidget(() => {
            editor.updateOptions({ scrollbar: { handleMouseWheel: true } });
          });

          // Disable scroll when editor loses focus
          editor.onDidBlurEditorWidget(() => {
            editor.updateOptions({ scrollbar: { handleMouseWheel: false } });
          });

          // Bind custom commands
          if (!readOnly && onRequestRun) {
            let commandId: string | null = null;

            // Function to add the command
            const addCmdEnterCommand = () => {
              if (!commandId) {
                commandId = editor.addCommand(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                  () => {
                    const selection = editor.getSelection();
                    const model = editor.getModel();

                    if (selection && model) {
                      const selectedText = model.getValueInRange(selection);
                      const content = selectedText || model.getValue();
                      onRequestRun(content);
                    }
                  }
                );
              }
            };

            // Attach command when editor gains focus
            editor.onDidFocusEditorWidget(() => {
              addCmdEnterCommand();
            });

            // Handle blur event
            editor.onDidBlurEditorWidget(() => {
              commandId = null;
            });

            // Add the command immediately if the editor is auto-focused
            if (autoFocus) {
              addCmdEnterCommand();
            }
          }

          // Handle autoFocus logic
          if (autoFocus) {
            editor.focus();
            const model = editor.getModel();
            if (model) {
              const lastLine = model.getLineCount();
              const lastColumn = model.getLineContent(lastLine).length + 1;
              editor.setPosition({ lineNumber: lastLine, column: lastColumn });
              editor.revealLineInCenter(lastLine); // Scroll to the last line
            }
          }

          // Scroll into view when focused
          if (autoScrollIntoView) {
            editor.onDidFocusEditorWidget(() => {
              setTimeout(() => {
                if (!editorRef.current) return;

                editorRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 250);
            });
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
