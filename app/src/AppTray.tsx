import { Stack } from "@mui/material";
import { ThemeSwitcher } from "containers/ThemeSwitcher";
import { ConnectionSwitcher } from "containers/ConnectionSwitcher";

export const AppTray = () => (
  <Stack direction={"row"}>
    <ThemeSwitcher />
    <ConnectionSwitcher />
  </Stack>
);
