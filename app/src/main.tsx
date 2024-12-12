/// <reference types="./vite-env.d.ts" />

import "/node_modules/flag-icons/css/flag-icons.min.css";
import "material-icons/iconfont/material-icons.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MuiProvider } from "./providers/MuiProvider/index.ts";
import { AuthProvider } from "./providers/AuthProvider";
import { ConnectionProvider } from "./providers/ConnectionProvider";
import { App } from "./App.tsx";
import "./i18n.ts";

// Wrap `AppRoutes` within the providers in the router definition
const router = createBrowserRouter(
  [
    {
      path: "/*", // Allow sub-routes to match
      element: (
        <AuthProvider>
          <ConnectionProvider>
            <App />
          </ConnectionProvider>
        </AuthProvider>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true, // Enables future flag
      v7_relativeSplatPath: true, // Enables future flag
      v7_fetcherPersist: true, // Enables future flag
      v7_normalizeFormMethod: true, // Enables future flag
      v7_partialHydration: true, // Enables future flag
      v7_skipActionErrorRevalidation: true, // Enables future flag
    },
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MuiProvider>
      <RouterProvider router={router} />
    </MuiProvider>
  </StrictMode>
);
