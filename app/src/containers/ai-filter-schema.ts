export function filterSchema(original: any) {
  // Define the structure of tableMap
  const tableMap: {
    [key: string]: {
      name: string;
      comment: string | null;
      type: string;
      has_partitions: boolean;
      partition_of: string | null;
      row_estimate: number;
      constraints: any[];
      indexes: any[];
      columns: any[];
    };
  } = {};

  // Initialize the tables structure with their respective data
  original.tables.forEach((table: any) => {
    tableMap[`${table.schema_name}.${table.table_name}`] = {
      name: `${table.schema_name}.${table.table_name}`,
      comment: table.comment,
      type: table.type,
      has_partitions: table.has_partitions,
      partition_of: table.partition_of,
      row_estimate: table.row_estimate,
      constraints: [],
      indexes: [],
      columns: [],
    };
  });

  // Integrate columns into their respective tables (if provided in the original structure)
  if (original.columns) {
    original.columns.forEach((column: any) => {
      const key = `${column.schema_name}.${column.table_name}`;
      if (tableMap[key]) {
        tableMap[key].columns = column.columns;
      }
    });
  }

  // Integrate constraints into their respective tables
  original.constraints.forEach((constraint: any) => {
    const key = `${constraint.schema_name}.${constraint.table_name}`;
    if (tableMap[key]) {
      tableMap[key].constraints = constraint.constraints.map(
        (item: { definition: any; [key: string]: any }) => {
          const { definition, ...rest } = item; // Explicitly type 'definition'
          return rest;
        }
      );
    }
  });

  // Integrate indexes into their respective tables
  original.indexes.forEach((index: any) => {
    const key = `${index.schema_name}.${index.table_name}`;
    if (tableMap[key]) {
      tableMap[key].indexes = index.indexes.map(
        (item: {
          definition: any;
          size_bytes: any;
          size_pretty: any;
          [key: string]: any;
        }) => {
          const { definition, size_bytes, size_pretty, ...rest } = item; // Explicitly type these fields
          return rest;
        }
      );
    }
  });

  // Convert the tableMap back to an array
  const tables = Object.values(tableMap);

  return tables;
}
