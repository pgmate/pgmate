import { Navigate } from "react-router-dom";
import { useLogout } from "hooks/use-auth";

export const LogoutView: React.FC = () => {
  useLogout();
  return <Navigate to="/" />;
};
