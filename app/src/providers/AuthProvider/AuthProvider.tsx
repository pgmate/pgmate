/**
 * Used in the App.tsx to choose the root UI element to render
 */

import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurtain } from "hooks/use-curtain";
import { useSubscribe } from "hooks/use-pubsub";
import { useStorage } from "hooks/use-storage";
import { LoginView } from "views/LoginView";

export const AuthContext = createContext({
  secret: "",
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useCurtain();
  const navigate = useNavigate();
  const storage = useStorage({ type: "local" });
  const [checked, setChecked] = useState(false);
  const [auth, setAuth] = useState<{
    secret: string;
  } | null>(null);

  // Handle login session
  useEffect(() => {
    setChecked(true);
    try {
      const auth = storage.getItem("admin-secret");
      if (auth) {
        setAuth(JSON.parse(auth as string));
      } else {
        setAuth(null);
      }
    } catch (error: any) {
      storage.removeItem("admin-secret");
    }
  }, []);

  useSubscribe("auth.success", (data: any) => {
    storage.setItem("admin-secret", JSON.stringify(data));
    setAuth(data);
  });

  // Handle logout by event
  useSubscribe("auth.logout", () => {
    console.log("AuthProvider::auth.logout()");
    storage.clearAll();
    setAuth(null);
    navigate("/");
  });

  // Handle logout on errors
  useSubscribe("auth.error", () => {
    storage.clearAll();
    setAuth(null);
    navigate("/");
  });

  const logout = useCallback(() => {
    console.log("AuthProvider::logout()");
    storage.clearAll();
    setAuth(null);
  }, [storage, navigate]);

  if (!checked) {
    return null;
  }

  if (auth) {
    return (
      <AuthContext.Provider value={{ ...auth, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <LoginView />;
};
