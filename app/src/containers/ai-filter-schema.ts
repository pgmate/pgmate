import { table } from "console";

// Helper function to move a field to the first position
const moveToFirst = (obj: any, newField: string, value: any) => {
  const { schema_name, table_name, ...rest } = obj; // Remove schema_name and table_name
  return { [newField]: value, ...rest }; // Add new field at the start
};

function cleanItem(obj: any, keywordsToRemove: string[] = []): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const value = obj[key];
    // Include key only if it's not in the list, not null/undefined, and not an empty array
    if (
      !keywordsToRemove.includes(key) &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function filterFields(original: any) {
  // Filter tables with essential fields
  const tables = original.tables.map((table: any) =>
    cleanItem(table, [
      "indexes_size",
      "heap_size",
      "total_relation_size",
      "has_partitions",
    ])
  );

  // Filter constraints with essential fields and remove "definition" key
  const constraints = original.constraints.map((constraint: any) => ({
    schema_name: constraint.schema_name,
    table_name: constraint.table_name,
    constraints: constraint.constraints.map((con: any) =>
      cleanItem(con, ["definition"])
    ),
  }));

  // Filter indexes with essential fields and remove "definition" key
  const indexes = original.indexes.map((index: any) => ({
    schema_name: index.schema_name,
    table_name: index.table_name,
    indexes: index.indexes.map((idx: any) =>
      cleanItem(idx, ["definition", "size_bytes", "size_pretty", "validity"])
    ),
  }));

  // Pass columns as-is, but clean their first-level keys
  const columns = original.columns
    ? original.columns.map((column: any) => ({
        schema_name: column.schema_name,
        table_name: column.table_name,
        columns: column.columns.map((col: any) => cleanItem(col, [])),
      }))
    : [];

  return { tables, constraints, indexes, columns };
}

function renameFields(filtered: any) {
  // Helper function to transform fkey_info
  const processFkeyInfo = (constraint: any) => {
    if (constraint.fkey_info) {
      constraint.fkey = {
        ...constraint.fkey_info,
        table: `${constraint.fkey_info.schema}.${constraint.fkey_info.table}`,
      };
      delete constraint.fkey_info; // Remove the original fkey_info
      delete constraint.fkey.schema; // Remove schema after merging
    }
    return constraint;
  };

  // Helper function to reorder keys in indexes
  const reorderIndexKeys = (index: any) => {
    const { name, type, is_unique, is_primary, columns, ...rest } = index;
    return {
      name,
      type,
      unique: is_unique, // Rename is_unique to unique
      primary: is_primary, // Rename is_primary to primary
      columns,
      ...rest, // Include any additional keys
    };
  };

  // Rename fields in tables
  const tables = filtered.tables.map((table: any) =>
    moveToFirst(
      {
        ...table,
        name: `${table.schema_name}.${table.table_name}`, // Add "name" field
      },
      "name",
      `${table.schema_name}.${table.table_name}`
    )
  );

  // Rename fields in constraints and process fkey
  const constraints = filtered.constraints.map((constraint: any) =>
    moveToFirst(
      {
        ...constraint,
        table: `${constraint.schema_name}.${constraint.table_name}`, // Add "table" field
        constraints: constraint.constraints.map(processFkeyInfo), // Process each fkey
      },
      "table",
      `${constraint.schema_name}.${constraint.table_name}`
    )
  );

  // Rename fields in indexes and reorder keys
  const indexes = filtered.indexes.map((index: any) =>
    moveToFirst(
      {
        ...index,
        table: `${index.schema_name}.${index.table_name}`, // Add "table" field
        indexes: index.indexes.map((idx: any) => {
          const { access_method, ...rest } = idx;
          return reorderIndexKeys({
            ...rest,
            type: access_method, // Rename access_method to type
          });
        }),
      },
      "table",
      `${index.schema_name}.${index.table_name}`
    )
  );

  // Rename fields in columns
  const columns = filtered.columns.map((column: any) =>
    moveToFirst(
      {
        ...column,
        table: `${column.schema_name}.${column.table_name}`, // Add "table" field
      },
      "table",
      `${column.schema_name}.${column.table_name}`
    )
  );

  return { tables, constraints, indexes, columns };
}

function reorganizeSchema(
  tableMap: any,
  { columns, constraints, indexes }: any
) {
  // Add columns to the respective table
  columns.forEach((columnGroup: any) => {
    if (tableMap[columnGroup.table]) {
      tableMap[columnGroup.table].columns = columnGroup.columns;
    }
  });

  // Add constraints to the respective table
  constraints.forEach((constraintGroup: any) => {
    if (tableMap[constraintGroup.table]) {
      tableMap[constraintGroup.table].constraints = constraintGroup.constraints;
    }
  });

  // Add indexes to the respective table
  indexes.forEach((indexGroup: any) => {
    if (tableMap[indexGroup.table]) {
      tableMap[indexGroup.table].indexes = indexGroup.indexes;
    }
  });
}

function nestPartitions(tableMap: any) {
  // Move tables with "partition_of" into the "partitions" array of the target table
  Object.values(tableMap).forEach((table: any) => {
    if (table.partition_of && tableMap[table.partition_of]) {
      const targetTable = tableMap[table.partition_of];

      // Ensure the target table has a partitions array
      if (!targetTable.partitions) {
        targetTable.partitions = [];
      }

      targetTable.partitions.push(
        cleanItem(table, ["columns", "type", "partition_of"])
      );
      delete tableMap[table.name]; // Remove the partition table from the top-level map
    }
  });
}

// Export function with reorganization and partition nesting
export function filterSchema(originalSchema: any) {
  const filteredSchema = filterFields(originalSchema);
  const renamedSchema = renameFields(filteredSchema);

  // Create a map of tables for quick lookup
  const tableMap = renamedSchema.tables.reduce((map: any, table: any) => {
    map[table.name] = {
      ...table,
      columns: [],
      constraints: [],
      indexes: [],
      partitions: [],
    };
    return map;
  }, {});

  // Reorganize and nest partitions
  reorganizeSchema(tableMap, renamedSchema);
  nestPartitions(tableMap);

  return Object.values(tableMap).map((table) => cleanItem(table));
}
