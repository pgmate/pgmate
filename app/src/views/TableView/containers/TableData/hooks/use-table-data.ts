import { useEffect, useRef, useState, useCallback } from "react";
import { useDynamicQuery } from "../../../../../hooks/use-query";

interface SchemaRow {
  column_name: string;
  data_type: string;
  character_maximum_length: number | null;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  is_primary_key: boolean;
}

const GET_SCHEMA = `
  SELECT
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.column_default,
      CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key
  FROM information_schema.columns c
  LEFT JOIN information_schema.key_column_usage kcu
      ON c.table_schema = kcu.table_schema
      AND c.table_name = kcu.table_name
      AND c.column_name = kcu.column_name
  LEFT JOIN information_schema.table_constraints tc
      ON tc.table_schema = kcu.table_schema
      AND tc.table_name = kcu.table_name
      AND tc.constraint_name = kcu.constraint_name
  WHERE c.table_schema = $1
    AND c.table_name = $2
  ORDER BY c.ordinal_position;
`;

const getPKey = (info: SchemaRow[]): string | null => {
  const pk = info.find((r) => r.is_primary_key);
  return pk ? pk.column_name : null;
};

export const useTableData = (
  conn: string,
  schema: string,
  table: string,
  {
    initialPageSize = 25,
    initialPage = 0,
    initialSorting = [],
  }: {
    initialPageSize?: number;
    initialPage?: number;
    initialSorting?: { field: string; sort: "asc" | "desc" }[];
  }
) => {
  const fetch = useDynamicQuery(conn);
  const dedupeRef = useRef<string | null>(null);
  const [columns, setColumns] = useState<SchemaRow[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(initialPage);
  const [sorting, setSorting] = useState(initialSorting);

  // Load the table schema
  useEffect(() => {
    // Dedupe the request due to strict mode
    if (dedupeRef.current === schema + table) return;
    dedupeRef.current = schema + table;

    setColumns([]);
    fetch<SchemaRow>(GET_SCHEMA, [schema, table]).then(([rows]) => {
      setColumns(rows);
    });
  }, [schema, table, fetch]);

  // Reset data
  useEffect(() => {
    setRows([]);
    setPage(initialPage);
    setSorting(initialSorting);
  }, [schema, table]);

  // Build the query
  useEffect(() => {
    if (!columns.length) return;

    const pkey = getPKey(columns);

    const orderBy =
      sorting?.length > 0
        ? sorting.map((s) => `"${s.field}" ${s.sort}`).join(", ")
        : pkey
        ? `${pkey} ASC`
        : null;

    const query = [
      "SELECT ",
      columns.map((r) => `"${r.column_name}"`).join(", "),
      "\n",
      "FROM ",
      `"${schema}"."${table}"`,
      "\n",
      orderBy ? `ORDER BY ${orderBy} ` : "",
      `LIMIT ${pageSize} `,
      `OFFSET ${page * pageSize}`,
    ].join("");

    // console.log(query);

    setQuery(query);
  }, [columns, page, pageSize, sorting]);

  // Fetch the data
  useEffect(() => {
    if (!query) return;
    fetch(query!, []).then(([rows]) => {
      setRows(rows || []);
    });
  }, [query]);

  const updateRow = useCallback(
    async (updatedRow: any, originalRow: any) => {
      console.log("Updating row:", updatedRow, originalRow);
      const pkeys = columns.filter((c) => c.is_primary_key);
      const identifyingKeys = pkeys.length > 0 ? pkeys : columns;

      // Prepare SET clause
      const fields: string[] = [];
      const values: any[] = [];
      columns.forEach((c) => {
        if (updatedRow[c.column_name] !== originalRow[c.column_name]) {
          fields.push(c.column_name);
          values.push(updatedRow[c.column_name]);
        }
      });

      // Prepare WHERE clause
      const whereValues: any[] = [];
      const whereClause = identifyingKeys
        .map((c, i) => {
          const columnName = `"${c.column_name}"`;
          if (c.data_type === "json" || c.data_type === "jsonb") {
            whereValues.push(originalRow[c.column_name]);
            return `${columnName}::text = $${i + fields.length + 1}`;
          }
          whereValues.push(originalRow[c.column_name]);
          return `${columnName} = $${i + fields.length + 1}`;
        })
        .join(" AND ");

      // Combine all values
      const allValues = [...values, ...whereValues];

      // Build the query
      const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(", ");
      const query = `UPDATE "${schema}"."${table}" SET ${setClause} WHERE ${whereClause}`;
      console.log(query, allValues);

      // Optimistic update
      setRows((prevRows) =>
        prevRows.map((row) => {
          const matches = identifyingKeys.every((key) => {
            const value =
              key.data_type === "json" || key.data_type === "jsonb"
                ? JSON.stringify(row[key.column_name])
                : row[key.column_name];
            const originalValue =
              key.data_type === "json" || key.data_type === "jsonb"
                ? JSON.stringify(originalRow[key.column_name])
                : originalRow[key.column_name];
            return value === originalValue;
          });
          return matches ? updatedRow : row;
        })
      );

      // Persist the update
      try {
        await fetch(query, allValues);
      } catch (error) {
        console.error("Error updating row:", error);

        // Rollback on failure
        setRows((prevRows) =>
          prevRows.map((row) => {
            const matches = identifyingKeys.every((key) => {
              const value =
                key.data_type === "json" || key.data_type === "jsonb"
                  ? JSON.stringify(row[key.column_name])
                  : row[key.column_name];
              const originalValue =
                key.data_type === "json" || key.data_type === "jsonb"
                  ? JSON.stringify(originalRow[key.column_name])
                  : originalRow[key.column_name];
              return value === originalValue;
            });
            return matches ? originalRow : row;
          })
        );
      }

      return updatedRow;
    },
    [schema, table, columns]
  );

  return {
    query,
    columns,
    rows,
    pageSize,
    setPageSize,
    page,
    setPage,
    sorting,
    setSorting,
    updateRow,
  };
};
