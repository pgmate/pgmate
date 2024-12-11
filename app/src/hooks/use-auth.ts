import { useContext, useEffect } from "react";
import { AuthContext } from "../providers/AuthProvider";

export const useAuth = () => useContext(AuthContext);

export const useLogout = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, []);
};
