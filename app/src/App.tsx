/**
 * Used in the App.tsx to choose the root UI element to render
 */

import { useCurtain } from "hooks/use-curtain";
import { ResponsiveLayout } from "components/ResponsiveLayout";
import { ShowDetails } from "popups/ShowDetails";
import { ConnectionsManager } from "popups/ConnectionsManager";
import { AppRoutes } from "./AppRoutes";
import { AppMenu } from "./AppMenu";
import { AppTray } from "./AppTray";

export const App = () => {
  useCurtain();

  return (
    <ResponsiveLayout
      icon={"auto_mode"}
      title={"PGMate"}
      subtitle={"The Postgres client that fucks"}
      menu={<AppMenu />}
      tray={<AppTray />}
    >
      <AppRoutes />
      <ShowDetails />
      <ConnectionsManager />
    </ResponsiveLayout>
  );
};
