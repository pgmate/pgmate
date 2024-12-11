import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useSubscribe } from "../hooks/use-pubsub";

export const ConnectionsManager: React.FC = () => {
  const [open, setOpen] = useState(false);

  useSubscribe("connections::manager", () => {
    setOpen(true);
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Connections Manager</DialogTitle>
      <DialogContent>coming soon...</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
