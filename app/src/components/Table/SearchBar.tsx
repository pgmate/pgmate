import { useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import {
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import { Icon } from "components/Icon";

export interface SearchBarData {
  search: string;
}

// Apply type to `SearchBar` for correct usage in parent components
export interface SearchBarApi {
  setValue: (field: keyof SearchBarData, value: string) => void;
  submitForm: () => void;
}

interface SearchBarProps {
  onSubmit: (data: SearchBarData) => void;
}

export const SearchBar = forwardRef(({ onSubmit }: SearchBarProps, ref) => {
  const {
    watch,
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchBarData>();

  useImperativeHandle(ref, () => ({
    setValue: (field: keyof SearchBarData, value: string) => {
      setValue(field, value);
      onSubmit(getValues());
    },
    submitForm: () => {
      onSubmit(getValues());
    },
  }));

  const search = watch("search");

  const handleClear = () => {
    setValue("search", "");
    onSubmit(getValues());
  };

  return (
    <Stack
      flex={1}
      component="form"
      direction={"row"}
      spacing={2}
      onSubmit={handleSubmit(onSubmit)}
      mb={1}
    >
      <TextField
        {...register("search")}
        label="Filter"
        variant="outlined"
        fullWidth
        size="small"
        margin="normal"
        error={!!errors.search}
        helperText={
          errors.search?.message ? String(errors.search?.message) : ""
        }
        slotProps={{
          inputLabel: { shrink: !!search },
          input: {
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClear}
                  edge="end"
                  aria-label="clear search filter"
                >
                  <Icon>clear_icon</Icon>
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
      <Button type="submit" variant="contained" size="small">
        <Icon>check</Icon>
      </Button>
    </Stack>
  );
});
