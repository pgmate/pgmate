import { Alert, AlertProps } from "@mui/material";

interface ErrorAlertProps extends AlertProps {
  error: Error | undefined;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, ...props }) => {
  if (!error) return;
  return (
    <Alert severity="error" {...props}>
      {error.message}
    </Alert>
  );
};
