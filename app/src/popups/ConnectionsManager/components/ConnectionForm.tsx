import React, { useImperativeHandle, useRef } from "react";
import { Form, FormApi } from "components/Form";
import { ConnectionData } from "../hooks/use-connections";

export interface ConnectionFormApis {
  save: () => void;
}

interface ConnectionFormProps {
  onSave: (data: any) => void;
  data?: ConnectionData;
}

export const ConnectionForm = React.forwardRef<
  ConnectionFormApis,
  ConnectionFormProps
>(({ data, onSave }, ref) => {
  const formRef = useRef<FormApi>(null);

  // Expose the save API
  useImperativeHandle(ref, () => ({
    save: async () => {
      const isValid = await formRef.current?.validate();
      if (!isValid) return;

      const values = formRef.current?.getValues();
      onSave({
        name: values?.name,
        desc: values?.desc,
        conn: {
          host: values?.host,
          port: values?.port,
          user: values?.user,
          password: values?.password,
          database: values?.database,
        },
        ssl: values?.ssl,
      });
    },
  }));

  return (
    <Form
      ref={formRef}
      fields={[
        {
          name: "name",
          type: "text",
          rules: {
            required: "Name is required",
          },
        },
        {
          name: "desc",
          type: "text",
        },
        {
          name: "host",
          type: "text",
          rules: {
            required: "Host is required",
          },
        },
        {
          name: "port",
          type: "text",
          rules: {
            required: "Port is required",
            validate: (value: any) => {
              const portNum = parseInt(value, 10);
              return portNum > 0 && portNum <= 65535
                ? true
                : "Invalid port number";
            },
          },
        },
        {
          name: "user",
          type: "text",
          rules: {
            required: "Port is required",
          },
        },
        {
          name: "password",
          type: "text",
          rules: {
            required: "Port is required",
          },
        },
        {
          name: "database",
          type: "text",
        },
        {
          name: "ssl",
          type: "boolean",
          rules: {
            validate: (value: any) =>
              ["true", "false"].includes(String(value).toLowerCase())
                ? undefined
                : "Value must be a boolean**",
          },
        },
      ]}
      defaultValues={{
        name: data?.name,
        desc: data?.desc,
        host: data?.conn.host,
        port: data?.conn.port,
        user: data?.conn.user,
        password: data?.conn.password,
        database: data?.conn.database,
        ssl: data?.ssl,
      }}
    />
  );
});
