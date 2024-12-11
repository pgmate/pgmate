import { CircularProgress, Box } from "@mui/material";

interface LoadingProps {
  show: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ show }) => {
  if (!show) return null;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
