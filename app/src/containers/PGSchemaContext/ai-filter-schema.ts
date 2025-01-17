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

function renameKeys(obj: any, keyTuples: [string, string][]): any {
  const result = { ...obj };

  keyTuples.forEach(([oldKey, newKey]) => {
    if (oldKey in result) {
      result[newKey] = result[oldKey];
      delete result[oldKey];
    }
  });

  return result;
}

// Function to sort tables by schema and table name
// Function to sort tables by schema and table name
function sortItems(originalSchema: any) {
  const sortedTables = originalSchema.tables.sort((a: any, b: any) => {
    const schemaOrder = (schemaName: string) => {
      if (schemaName === "public") return 0;
      if (schemaName === "pg_catalog") return 1;
      if (schemaName === "pg_toast") return 2;
      if (schemaName.startsWith("pg_")) return 3;
      if (schemaName === "information_schema") return 4;
      return 5; // Default order for other schemas
    };

    const orderA = schemaOrder(a.schema_name);
    const orderB = schemaOrder(b.schema_name);

    // Compare by schema order first
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // If schemas are the same, compare table names alphabetically
    return a.table_name.localeCompare(b.table_name);
  });

  return {
    ...originalSchema,
    tables: sortedTables, // Replace with the sorted list of tables
  };
}

function filterFields(original: any) {
  // Filter tables with essential fields
  const tables = original.tables.map((table: any) =>
    cleanItem(table, [
      "indexes_size",
      "heap_size",
      "total_relation_size",
      "toast_size",
      "has_partitions",
    ])
  );

  // Filter constraints with essential fields and remove "definition" key
  const constraints = original.constraints.map((constraint: any) => ({
    schema_name: constraint.schema_name,
    table_name: constraint.table_name,
    constraints: constraint.constraints.map((con: any) =>
      renameKeys(cleanItem(con, ["definition"]), [["columns", "cols"]])
    ),
  }));

  // Filter indexes with essential fields and remove "definition" key
  const indexes = original.indexes.map((index: any) => ({
    schema_name: index.schema_name,
    table_name: index.table_name,
    indexes: index.indexes.map((idx: any) =>
      renameKeys(
        cleanItem(idx, ["definition", "size_bytes", "size_pretty", "validity"]),
        [["columns", "cols"]]
      )
    ),
  }));

  // Pass columns as-is, but clean their first-level keys
  const columns = original.columns
    ? original.columns.map((column: any) => ({
        schema_name: column.schema_name,
        table_name: column.table_name,
        columns: column.columns.map((col: any) =>
          renameKeys(cleanItem(col, ["position"]), [
            ["data_type", "type"],
            ["default_value", "def"],
            ["is_pkey", "pk"],
            ["is_null", "n"],
          ])
        ),
      }))
    : [];

  return { tables, constraints, indexes, columns };
}

function renameFields(filtered: any) {
  // Helper function to transform fkey_info
  const processFkeyInfo = (constraint: any) => {
    if (constraint.fkey_info) {
      constraint.fkey = cleanItem(
        {
          ...constraint.fkey_info,
          table: `${constraint.fkey_info.schema}.${constraint.fkey_info.table}`,
          cols: constraint.fkey_info.columns,
        },
        ["columns"]
      );
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
    cleanItem(
      moveToFirst(
        {
          ...table,
          name: `${table.schema_name}.${table.table_name}`, // Add "name" field
          rows: table.row_estimate, // Rename row_estimate to rows
        },
        "name",
        `${table.schema_name}.${table.table_name}`
      ),
      ["row_estimate"]
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
      tableMap[columnGroup.table].cols = columnGroup.columns;
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

function calcPartitionRows(tableMap: any) {
  Object.values(tableMap).forEach((table: any) => {
    if (table.partitions && table.partitions.length > 0) {
      const partitionRows = table.partitions.reduce(
        (sum: number, partition: any) => {
          return sum + (partition.rows || 0); // Add rows from each partition
        },
        0
      );

      table.rows = (table.rows || 0) + partitionRows; // Update parent table's rows
    }
  });
}

const splitResults = (tableMap: any) =>
  Object.values(tableMap).reduce(
    (acc: any, table: any) => {
      if (table.type === "r" || table.type === "p") {
        acc.tables.push(cleanItem(table, ["type"]));
      } else if (table.type === "v") {
        acc.views.push(cleanItem(table, ["type"]));
      } else if (table.type === "m") {
        acc.materialized.push(cleanItem(table, ["type"]));
      } else {
        acc.others.push(cleanItem(table, ["type"]));
      }

      return acc;
    },
    {
      tables: [],
      views: [],
      materialized: [],
      others: [],
    }
  );

// Export function with reorganization and partition nesting
export function filterSchema(originalSchema: any) {
  const sortedSchema = sortItems(originalSchema); // S
  const filteredSchema = filterFields(sortedSchema);
  const renamedSchema = renameFields(filteredSchema);

  // Create a map of tables for quick lookup
  const tableMap = renamedSchema.tables.reduce((map: any, table: any) => {
    map[table.name] = {
      ...table,
      cols: [],
      constraints: [],
      indexes: [],
      partitions: [],
    };
    return map;
  }, {});

  // Reorganize and nest partitions
  reorganizeSchema(tableMap, renamedSchema);
  nestPartitions(tableMap);
  calcPartitionRows(tableMap);

  // Split the results into different categories
  return splitResults(tableMap);
}
