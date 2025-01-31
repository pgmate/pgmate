import { useRef } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { EventPopup, EventPopupAPI } from "components/EventPopup";
import { Form, FormApi } from "components/Form";
import { useCreateDb } from "./use-create-db";

interface CreateDBProps {
  onComplete: (path: string) => void;
}

export const CreateDB: React.FC<CreateDBProps> = ({ onComplete }) => {
  const formRef = useRef<FormApi>(null);
  const createDb = useCreateDb();

  const popupRef = useRef<EventPopupAPI>(null);

  const handleClose = () => popupRef.current?.close();

  const handleSave = async () => {
    const isValid = formRef.current?.validate();
    if (!isValid) return;

    try {
      const values = formRef.current?.getValues();
      const path = await createDb(values);
      handleClose();
      onComplete(path);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <EventPopup ref={popupRef} event="create:db">
      <DialogTitle>New Database</DialogTitle>
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
