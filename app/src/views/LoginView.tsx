import axios from "axios";
import * as crypto from "crypto-js";
import React, { useState } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Icon } from "components/Icon";
import { usePubSub } from "hooks/use-pubsub";

const API_PREFIX = import.meta.env.VITE_API_PREFIX == "/" ? "" : "/api";
// console.log("@ENV", import.meta.env);
// console.log("@API_PREFIX", API_PREFIX);
// console.log("@VITE_API_PREFIX", import.meta.env.VITE_API_PREFIX);
// console.log("@VITE_NODE_ENV", import.meta.env.VITE_NODE_ENV);

export interface LoginFormInputs extends FieldValues {
  secret: string;
}

export const LoginView: React.FC = () => {
  const bus = usePubSub();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      secret: import.meta.env.VITE_NODE_ENV === "development" ? "pgmate" : "", // Default value for early development
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _onSubmit = (data: LoginFormInputs) => {
    setError(null);

    // Hash the password before sending
    const secret = crypto.SHA256(data.secret).toString(crypto.enc.Hex);

    axios
      .get(`${API_PREFIX}/admin/v1/status`, {
        headers: {
          "x-pgmate-admin-secret": secret,
        },
      })
      .then(() => bus.emit("auth.success", { ...data, secret }))
      .catch((error) => {
        setError(error?.response.data.message || error.message);
        bus.emit("auth.error", error);
      });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h4" sx={{ mb: 4 }}>
        PGMate
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(_onSubmit)}
        sx={{ width: "100%" }}
      >
        <Controller
          name="secret"
          control={control}
          rules={{ required: "The admin secret is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="admin secret"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              error={!!errors.secret}
              helperText={errors.secret?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <Icon>visibility_off</Icon>
                        ) : (
                          <Icon>visibility</Icon>
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};
