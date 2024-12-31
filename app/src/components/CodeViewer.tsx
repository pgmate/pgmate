import Editor from "@monaco-editor/react";
import { IconButton, Tooltip, Box, useTheme } from "@mui/material";
import { Icon } from "components/Icon";

export const CodeViewer = ({
  code,
  language,
  height = 75,
}: {
  code: string;
  language: string;
  height?: number;
}) => {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs-light";

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      // Replace with notistack
    });
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
      }}
    >
      {/* Monaco Editor in read-only mode */}
      <Editor
        language={language}
        value={code}
        theme={monacoTheme}
        height={height}
        options={{
          readOnly: true,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          padding: {
            top: 10,
          },
          fontSize: 10,
          contextmenu: false,
        }}
        onMount={(editor) => {
          editor.addCommand(0, () => null);
        }}
      />

      {/* Copy button */}
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
    </Box>
  );
};
