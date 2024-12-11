import { createElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, Stack, Button } from "@mui/material";
import { FieldText } from "./components/FieldText";
import { FieldPassword } from "./components/FieldPassword";
import { fillDefaults } from "./utils/fill-defaults";

import { FormField, FormProps, FormFieldType } from "./types";

export const Form = ({
  fields,
  defaultValues = {},
  onSubmit,
  onCancel,
}: FormProps): React.ReactElement => {
  const { control, reset, handleSubmit } = useForm({
    defaultValues: fillDefaults(fields, defaultValues),
  });

  const renderField = (field: FormField) => {
    const fieldConfig =
      typeof field === "string"
        ? { name: field, type: "text" as FormFieldType }
        : field;

    const fieldCmp = (() => {
      switch (fieldConfig.type) {
        case "password":
          return FieldPassword;
        default:
          return FieldText;
      }
    })();

    return createElement(fieldCmp, {
      ...fieldConfig,
      key: fieldConfig.name,
      control,
    });
  };

  // Apply new default values when configuration changes
  useEffect(() => {
    reset(fillDefaults(fields, defaultValues));
  }, [fields, defaultValues, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      {fields.map((field) => renderField(field))}

      <Stack direction="row" spacing={2} justifyContent={"flex-end"}>
        <Button
          type="reset"
          variant="text"
          onClick={() => {
            reset(fillDefaults(fields, defaultValues));
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Stack>
    </Box>
  );
};
