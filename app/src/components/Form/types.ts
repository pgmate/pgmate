import { RegisterOptions } from "react-hook-form";

export type FormFieldType = "text" | "password" | "boolean";

export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
  rules?: RegisterOptions;
}

export type FormField = string | FormFieldConfig;

export type FormDefaultValues = Record<string, any>;

export interface FormProps {
  fields: FormField[];
  defaultValues?: FormDefaultValues;
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  disableButtons?: boolean;
}

export interface FormFieldProps extends FormFieldConfig {
  control: any;
  rules?: RegisterOptions;
}

export type FormApi = {
  getValues: () => Record<string, any>;
  getValue: (fieldName: string) => any;
  reset: () => void;
  validate: () => Promise<boolean>;
};
