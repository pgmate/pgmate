import { Alert } from "@mui/material";

interface ResultsEmptyProps {
  data: any;
}

export const ResultsEmpty: React.FC<ResultsEmptyProps> = ({ data }) => {
  return (
    <Alert severity="info">
      {data?.meta?.command === "SELECT"
        ? "No rows found"
        : data?.meta?.command || "The query yelded no results"}
    </Alert>
  );
};
