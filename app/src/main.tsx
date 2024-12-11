/// <reference types="./vite-env.d.ts" />

import "/node_modules/flag-icons/css/flag-icons.min.css";
import "material-icons/iconfont/material-icons.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { MuiProvider } from "./providers/MuiProvider/index.ts";
import { AuthProvider } from "./providers/AuthProvider";
import { ConnectionProvider } from "./providers/ConnectionProvider";
import { App } from "./App.tsx";
import "./i18n.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MuiProvider>
      <Router>
        <AuthProvider>
          <ConnectionProvider>
            <App />
          </ConnectionProvider>
        </AuthProvider>
      </Router>
    </MuiProvider>
  </StrictMode>
);
