import { Box } from "@mui/material";

interface CodeBoxProps {
  data: object;
}

export const CodeBox: React.FC<CodeBoxProps> = ({ data }) => {
  return (
    <Box
      component={"pre"}
      sx={{
        padding: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
        borderRadius: 1,
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        fontSize: 12,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </Box>
  );
};
