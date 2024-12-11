export type FormFieldType = "text" | "password";

export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
}

export type FormField = string | FormFieldConfig;

export type FormDefaultValues = Record<string, any>;

export interface FormProps {
  fields: FormField[];
  defaultValues?: FormDefaultValues;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export interface FormFieldProps extends FormFieldConfig {
  control: any;
}
