import { useCallback } from "react";

interface UseStorageReturn {
  getItem: <T>(key: string, defaultValue?: T | (() => T)) => T | undefined;
  setItem: <T>(key: string, value: T) => void;
  removeItem: (key: string) => void;
  clearAll: () => void;
}

export const useStorage = ({
  namespace = "app",
  type = "local",
}: {
  namespace?: string;
  type?: "local" | "session";
} = {}): UseStorageReturn => {
  const prefix = `${namespace}.`;
  const indexKey = `${namespace}_index`;
  const engine = type === "local" ? localStorage : sessionStorage;

  // Helper function to update the index of keys
  const updateIndex = (key: string, add: boolean) => {
    const index = JSON.parse(engine.getItem(indexKey) || "[]") as string[];
    const updatedIndex = add
      ? Array.from(new Set([...index, key]))
      : index.filter((k) => k !== key);
    engine.setItem(indexKey, JSON.stringify(updatedIndex));
  };

  const getItem = useCallback(
    <T>(key: string, defaultValue?: T | (() => T)): T | undefined => {
      const fullKey = `${prefix}${key}`;
      const storedValue = engine.getItem(fullKey);

      if (storedValue !== null) {
        try {
          return JSON.parse(storedValue) as T;
        } catch (error) {
          console.error(
            `Error parsing stored value for key "${fullKey}":`,
            error
          );
          return undefined; // Return undefined instead of null on parse error
        }
      }

      if (defaultValue !== undefined) {
        return typeof defaultValue === "function"
          ? (defaultValue as () => T)()
          : (defaultValue as T);
      }

      return undefined; // No default value, no stored value
    },
    [prefix]
  );

  // Set a value in local storage
  const setItem = useCallback(
    <T>(key: string, value: T) => {
      const fullKey = `${prefix}${key}`;
      try {
        engine.setItem(fullKey, JSON.stringify(value));
        updateIndex(key, true);
      } catch (error) {
        console.error(`Error setting value for key "${fullKey}":`, error);
      }
    },
    [prefix]
  );
  // Remove a value from local storage
  const removeItem = useCallback(
    (key: string) => {
      const fullKey = `${prefix}${key}`;
      engine.removeItem(fullKey);
      updateIndex(key, false);
    },
    [prefix]
  );

  // Clear all values in the namespace
  const clearAll = useCallback(() => {
    const index = JSON.parse(engine.getItem(indexKey) || "[]") as string[];
    index.forEach((key) => {
      engine.removeItem(`${prefix}${key}`);
    });
    engine.removeItem(indexKey);
  }, [prefix]);

  // Memoized return object
  return {
    getItem,
    setItem,
    removeItem,
    clearAll,
  };
};
