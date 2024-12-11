import { FormField, FormDefaultValues } from "../types";

// Fills the default values for all fields even if missing
export const fillDefaults = (
  fields: FormField[],
  defaultValues: FormDefaultValues
) =>
  fields.reduce((acc, field) => {
    const fieldName = typeof field === "string" ? field : field.name;
    acc[fieldName] = defaultValues[fieldName] ?? ""; // Default to empty string
    return acc;
  }, {} as Record<string, any>);
