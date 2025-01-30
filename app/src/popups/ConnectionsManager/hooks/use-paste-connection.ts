import { useEffect } from "react";
import { ConnectionTarget } from "./use-connections";

export const usePasteConnection = (
  callback: (
    groups: ConnectionTarget,
    connectionString: string
  ) => void = () => {}
) => {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData("text") || "";
      const postgresRegex =
        /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)(?:\?(?:sslmode|ssl)=(.+))?/i;

      const match = pastedText.match(postgresRegex);
      if (match) {
        const groups: ConnectionTarget = {
          user: match[1],
          password: match[2],
          host: match[3],
          port: parseInt(match[4] || "5432", 10),
          database: match[5],
          ssl: match[6] || "false",
        };
        callback(groups, pastedText);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [callback]);
};
