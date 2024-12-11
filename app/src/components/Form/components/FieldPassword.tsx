import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

import { FormFieldProps } from "../types";

export const FieldPassword: React.FC<FormFieldProps> = ({ control, name }) => {
  return (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={name}
          type={"password"}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      )}
    />
  );
};
