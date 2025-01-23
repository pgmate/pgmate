import { Stack } from "@mui/material";
import { ThemeSwitcher } from "containers/ThemeSwitcher";
import { ConnectionSwitcher } from "containers/ConnectionSwitcher";
import { PGSchemaInfo } from "containers/PGSchemaInfo";
import { PGSchemaContext } from "containers/PGSchemaContext";

export const AppTray = () => (
  <Stack direction={"row"}>
    <ThemeSwitcher />
    <PGSchemaInfo />
    <PGSchemaContext />
    <ConnectionSwitcher />
  </Stack>
);
