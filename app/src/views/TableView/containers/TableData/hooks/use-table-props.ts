import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useStorage } from "../../../../../hooks/use-storage";

const DEFAULTS = {
  page: 0,
  pageSize: 5,
  sorting: [],
  columnSize: {},
};

interface Props {
  page: number;
  pageSize: number;
  sorting: any[];
  columnSize: Record<string, number>;
}
interface PropsUpdate {
  page?: number;
  pageSize?: number;
  sorting?: any[];
  columnSize?: Record<string, number>;
}

export const useTableProps = () => {
  const { conn, schema, table } = useParams<{
    conn: string;
    schema: string;
    table: string;
  }>();

  const storage = useStorage();
  const storageKey = `table.${conn}.${schema}.${table}.params`;

  // First load and update on context change
  const [state, setState] = useState<Props>(
    storage.getItem(storageKey) || DEFAULTS
  );

  useEffect(() => {
    setState(storage.getItem(storageKey) || DEFAULTS);
  }, [conn, schema, table]);

  // Update storage on state change
  const update = useCallback(
    (newState: PropsUpdate) => {
      const updatedState = {
        ...state,
        ...newState,
      };
      storage.setItem(storageKey, updatedState);
      setState(updatedState);
    },
    [state, storage, storageKey]
  );

  const updateColumnSize = useCallback(
    (column: string, size: number) => {
      const updatedSize = {
        ...state.columnSize,
        [column]: size,
      };
      update({ columnSize: updatedSize });
    },
    [update]
  );

  return {
    ...state,
    update,
    updateColumnSize,
  };
};
