// Example of pasted connection:
// postgres://user:password@localhost:5432/database

import { useEffect } from "react";
import { ConnectionTarget } from "./use-connections"; // Ensure this is the correct path

export const usePasteConnection = (
  callback: (
    groups: ConnectionTarget,
    connectionString: string
  ) => void = () => {}
) => {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Get pasted text
      const pastedText = event.clipboardData?.getData("text") || "";

      // Define regex for PostgreSQL connection string
      const postgresRegex =
        /^postgres:\/\/(?<user>[^:]+):(?<password>[^@]+)@(?<host>[^:\/]+):(?<port>\d+)\/(?<database>.+)$/;

      const match = pastedText.match(postgresRegex);

      if (match) {
        // Map regex groups to ConnectionTarget type
        const groups: ConnectionTarget = {
          user: match[1],
          password: match[2],
          host: match[3],
          port: parseInt(match[4], 10),
          database: match[5],
        };

        // Trigger the callback
        callback(groups, pastedText);
      }
    };

    // Attach event listener
    window.addEventListener("paste", handlePaste);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [callback]);
};
