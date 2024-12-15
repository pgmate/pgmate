import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

import { FormFieldProps } from "../types";

export const FieldText: React.FC<FormFieldProps> = ({
  control,
  name,
  rules,
}) => {
  return (
    <Controller
      key={name}
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={name}
          type={"text"}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!fieldState.error}
          helperText={fieldState.error?.message || ""}
        />
      )}
    />
  );
};
