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

export const AICompact = (schema: any) => {
  const transformColumns = (items: any[]) => {
    return items.map((item: any) => {
      return {
        ...cleanItem(
          {
            ...item,
            cols: item.cols.map((col: any) => col.name),
            // Map primary keys to their respective column names
            pkeys: item.pkeys
              ? item.pkeys.flatMap((pk: any) => pk.cols || [])
              : [],
            // Map foreign keys to their respective column names
            fkeys: item.fkeys
              ? item.fkeys.flatMap((fk: any) => fk.cols || [])
              : [],
          },
          ['rows', 'indexes'],
        ),
      };
    });
  };

  return {
    tables: transformColumns(schema.tables),
    views: transformColumns(schema.views),
    materialized: transformColumns(schema.materialized),
    others: schema.others,
  };
};
