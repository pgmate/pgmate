import {
  createElement,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useForm } from "react-hook-form";
import { Box, Stack, Button } from "@mui/material";
import { FieldText } from "./components/FieldText";
import { FieldPassword } from "./components/FieldPassword";
import { fillDefaults } from "./utils/fill-defaults";
import { FormField, FormProps, FormFieldType } from "./types";

export const Form = forwardRef(
  (
    {
      fields,
      defaultValues = {},
      disableButtons,
      onSubmit,
      onCancel,
    }: FormProps,
    ref
  ) => {
    const { control, reset, handleSubmit, getValues, trigger } = useForm({
      defaultValues: fillDefaults(fields, defaultValues),
    });

    useImperativeHandle(
      ref,
      () => ({
        getValues: () => getValues(),
        getValue: (fieldName: string) => getValues(fieldName),
        reset: () => reset(fillDefaults(fields, defaultValues)),
        validate: async () => {
          return await trigger();
        },
      }),
      [getValues, trigger]
    );

    const renderField = (field: FormField) => {
      const fieldConfig =
        typeof field === "string"
          ? { name: field, type: "text" as FormFieldType }
          : field;

      const fieldCmp =
        fieldConfig.type === "password" ? FieldPassword : FieldText;

      // const rules: RegisterOptions = {};
      // if (fieldConfig.validate) {
      //   rules.validate = fieldConfig.validate;
      // }

      return createElement(fieldCmp, {
        ...fieldConfig,
        key: fieldConfig.name,
        control,
        // rules,
      });
    };

    useEffect(() => {
      reset(fillDefaults(fields, defaultValues));
    }, [fields, JSON.stringify(defaultValues), reset]);

    return (
      <Box
        component="form"
        onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {fields.map((field) => renderField(field))}

        {(onCancel || onSubmit) && (
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"flex-end"}
            sx={{ display: disableButtons ? "none" : "flex" }}
          >
            {onCancel && (
              <Button
                type="reset"
                variant="text"
                onClick={() => {
                  reset(fillDefaults(fields, defaultValues));
                  onCancel();
                }}
              >
                Cancel
              </Button>
            )}
            {onSubmit && (
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            )}
          </Stack>
        )}
      </Box>
    );
  }
);
