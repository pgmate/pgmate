import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePubSub } from "hooks/use-pubsub";
import { useURLConnection } from "hooks/use-connections";
import Editor from "@monaco-editor/react";
import { IconButton, Tooltip, Box, Stack, useTheme } from "@mui/material";
import { Icon } from "components/Icon";

export const CodeViewer = ({
  code,
  language,
  height = 75,
  onMount,
  disableCopy,
  disableSendToSQLStudio,
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
  disableSendToSQLStudio?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onRequestRun?: (content: string) => void;
  autoFocus?: boolean; // Gain focus on mount
  autoScrollIntoView?: boolean; // Scroll into view when focused
}) => {
  const navigate = useNavigate();
  const bus = usePubSub();
  const conn = useURLConnection();
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      // Replace with notistack
    });
  };

  const handleSendToSQLStudio = () => {
    navigate(`/${conn?.name}/${conn?.database}/query`);
    setTimeout(() => {
      bus.emit("QueryView.addCode", code);
    }, 250);
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
        display: "flex",
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: "5px",
        border:
          theme.palette.mode === "light"
            ? `1px solid ${theme.palette.divider}`
            : "none",
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
          // Enables/Disables scroll when editor gains focus
          editor.updateOptions({ scrollbar: { handleMouseWheel: false } });
          editor.onDidFocusEditorWidget(() => {
            editor.updateOptions({ scrollbar: { handleMouseWheel: true } });
          });
          editor.onDidBlurEditorWidget(() => {
            editor.updateOptions({ scrollbar: { handleMouseWheel: false } });
          });

          // Cmd/Ctrl + Enter to run query
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

          // Escape key to blur editor
          if (!readOnly) {
            editor.onKeyDown((e) => {
              if (e.keyCode === monaco.KeyCode.Escape) {
                e.preventDefault();
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }
            });
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
                  block: "nearest",
                });
              }, 250);
            });
          }

          onMount?.(editor);
        }}
        onChange={handleEditorChange}
      />

      <Stack
        direction={"row"}
        spacing={1}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        {/* Copy button */}
        {!disableCopy && (
          <Tooltip title="Copy Code">
            <IconButton
              onClick={handleCopy}
              size={"small"}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                width: 24,
                height: 24,
                fontSize: 16,
              }}
            >
              <Icon>content_copy</Icon>
            </IconButton>
          </Tooltip>
        )}

        {/* Send to SQL Studio button */}
        {!disableSendToSQLStudio && (
          <Tooltip title="Send to SQL Studio">
            <IconButton
              onClick={handleSendToSQLStudio}
              size={"small"}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                width: 24,
                height: 24,
                fontSize: 16,
              }}
            >
              <Icon>code</Icon>
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};
