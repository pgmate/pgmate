import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useSubscribe } from "hooks/use-pubsub";

interface ShowDetailsData {
  title: React.ReactNode;
  body: React.ReactNode;
  bodyProps?: React.ComponentProps<typeof DialogContent>;
}

export const ShowDetails: React.FC = () => {
  const [data, setData] = useState<ShowDetailsData | null>(null);
  const [open, setOpen] = useState(false);

  useSubscribe("show::details", (data) => {
    setData(data);
    setOpen(true);
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setData(null), 500);
  };

  console.log(data?.bodyProps);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{data?.title}</DialogTitle>
      <DialogContent {...data?.bodyProps}>{data?.body}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
