import { useState, useEffect } from "react";
import { useStorage } from "../../../hooks/use-storage";

const BASE_KEY = "schemas.expanded";

export const useSchemaTree = (conn: Connection) => {
  const storage = useStorage({ type: "local" });

  // Load default set of expanded schemas from local storage
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    () =>
      new Set(
        storage.getItem(`${BASE_KEY}.${conn.name}.${conn.database}`) || [
          "public",
        ]
      )
  );

  // Load expanded schemas from local storage when switching connections
  useEffect(() => {
    const load = storage.getItem(
      `${BASE_KEY}.${conn.name}.${conn.database}`
    ) || ["public"];
    if (load) {
      setExpandedSchemas(new Set(load as string[]));
    }
  }, [conn]);

  // Persist expanded schemas to local storage
  useEffect(() => {
    storage.setItem(
      `${BASE_KEY}.${conn.name}.${conn.database}`,
      Array.from(expandedSchemas)
    );
  }, [conn, expandedSchemas]);

  const handleToggle = (schemaName: string) => {
    setExpandedSchemas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(schemaName)) {
        newSet.delete(schemaName);
      } else {
        newSet.add(schemaName);
      }
      return newSet;
    });
  };

  return {
    expandedSchemas,
    handleToggle,
  };
};
