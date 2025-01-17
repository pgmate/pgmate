// Helper function to move a field to the first position
const moveToFirst = (obj: any, newField: string, value: any) => {
  const { schema_name, table_name, ...rest } = obj; // Remove schema_name and table_name
  return { [newField]: value, ...rest }; // Add new field at the start
};

function cleanItem(obj: any, keywordsToRemove: string[]): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const value = obj[key];
    // Include key only if it's not in the list and not null/undefined
    if (
      !keywordsToRemove.includes(key) &&
      value !== null &&
      value !== undefined
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
      cleanItem(idx, ["definition", "size_bytes", "size_pretty"])
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
  // Rename fields in tables
  const tables = filtered.tables.map((table: any) =>
    moveToFirst(
      table,
      "name",
      `${table.schema_name}.${table.table_name}` // Add "name" field
    )
  );

  // Rename fields in constraints
  const constraints = filtered.constraints.map((constraint: any) =>
    moveToFirst(
      constraint,
      "table",
      `${constraint.schema_name}.${constraint.table_name}` // Add "table" field
    )
  );

  // Rename fields in indexes
  const indexes = filtered.indexes.map((index: any) =>
    moveToFirst(
      index,
      "table",
      `${index.schema_name}.${index.table_name}` // Add "table" field
    )
  );

  // Rename fields in columns
  const columns = filtered.columns.map((column: any) =>
    moveToFirst(
      column,
      "table",
      `${column.schema_name}.${column.table_name}` // Add "table" field
    )
  );

  return { tables, constraints, indexes, columns };
}

function reorganizeSchema(filteredSchema: any) {
  const { tables, columns, constraints, indexes } = filteredSchema;

  // Create a map of tables for quick lookup
  const tableMap = tables.reduce((map: any, table: any) => {
    map[table.name] = { ...table, columns: [], constraints: [], indexes: [] };
    return map;
  }, {});

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

  // Return tables with reorganized structure
  return Object.values(tableMap);
}

// Export function with reorganization
export function filterSchema(originalSchema: any) {
  const filteredSchema = renameFields(filterFields(originalSchema));
  const reorganizedSchema = reorganizeSchema(filteredSchema);
  return reorganizedSchema;
}
