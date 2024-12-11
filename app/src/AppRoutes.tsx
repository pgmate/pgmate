import { RouteObject, useRoutes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { LogoutView } from "./views/LogoutView";
import { HomeView } from "./views/HomeView";
import { ConnectionView } from "./views/ConnectionView";
import { SchemaView } from "./views/SchemaView";
import { TableView } from "./views/TableView";
import { QueryView } from "./views/QueryView";
import { FactsView } from "./views/FactsView";

const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/logout",
    element: <LogoutView />,
  },
  {
    path: "/home",
    element: <HomeView />,
  },
  {
    path: "/facts/:tag",
    element: <FactsView />,
  },
  {
    path: "/:conn",
    element: <ConnectionView />,
  },
  {
    path: "/:conn/query",
    element: <QueryView />,
  },
  {
    path: "/:conn/:schema",
    element: <SchemaView />,
  },
  {
    path: "/:conn/:schema/:table/:mode",
    element: <TableView />,
  },
];

export const AppRoutes = () => useRoutes(routesConfig);
