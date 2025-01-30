import { useRef } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { EventPopup, EventPopupAPI } from "components/EventPopup";
import { Form, FormApi } from "components/Form";
import { useCreateSchema } from "./use-create-schema";

interface CreateSchemaProps {
  onComplete: (path: string) => void;
}

export const CreateSchema: React.FC<CreateSchemaProps> = ({ onComplete }) => {
  const formRef = useRef<FormApi>(null);
  const CreateSchema = useCreateSchema();

  const popupRef = useRef<EventPopupAPI>(null);

  const handleClose = () => popupRef.current?.close();

  const handleSave = async () => {
    const isValid = formRef.current?.validate();
    if (!isValid) return;

    try {
      const values = formRef.current?.getValues();
      const path = await CreateSchema(values);
      handleClose();
      onComplete(path);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <EventPopup ref={popupRef} event="create:schema">
      <DialogTitle>New Schema</DialogTitle>
      <DialogContent>
        <Form
          disableButtons
          ref={formRef}
          onSubmit={handleSave}
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
          ]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
        <Button variant="contained" onClick={handleSave} autoFocus>
          Save
        </Button>
      </DialogActions>
    </EventPopup>
  );
};
