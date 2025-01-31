import { Box, Button, Icon, Alert } from "@mui/material";
import { Link } from "react-router-dom";

interface ConnectionErrorProps {
  error: string;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ error }) => {
  return (
    <Box sx={{ m: 4 }}>
      <Alert severity="error">{error}</Alert>
      <Button
        component={Link}
        to={"/"}
        startIcon={<Icon>arrow_back_ios</Icon>}
        sx={{ ml: 2, mt: 2 }}
      >
        Back to home
      </Button>
    </Box>
  );
};
