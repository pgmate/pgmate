import { RouteObject, useRoutes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { LogoutView } from "views/LogoutView";
import { HomeView } from "views/HomeView";
import { ConnectionView } from "views/ConnectionView";
import { DatabaseView } from "views/DatabaseView";
import { SchemaView } from "views/SchemaView";
import { TableView } from "views/TableView";
import { QueryView } from "views/QueryView";
import { FactsView } from "views/FactsView";
import { Text2SQLView } from "views/Text2SQLView";
import { AskView } from "views/AskView";

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
    path: "/:conn/:db/query",
    element: <QueryView />,
  },
  {
    path: "/:conn/:db/text2sql",
    element: <Text2SQLView />,
  },
  {
    path: "/:conn/:db/ask",
    element: <AskView />,
  },
  {
    path: "/:conn/:db",
    element: <DatabaseView />,
  },
  {
    path: "/:conn/:db/:schema",
    element: <SchemaView />,
  },
  {
    path: "/:conn/:db/:schema/:table/:mode",
    element: <TableView />,
  },
];

export const AppRoutes = () => useRoutes(routesConfig);
