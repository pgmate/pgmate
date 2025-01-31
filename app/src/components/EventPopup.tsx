import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Dialog } from "@mui/material";
import { useSubscribe } from "hooks/use-pubsub";

interface EventPopupProps {
  event: string;
  children: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface EventPopupAPI {
  open: () => void;
  close: () => void;
}

export const EventPopup = forwardRef<EventPopupAPI, EventPopupProps>(
  ({ event, onOpen, onClose, children }, ref) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
      setOpen(true);
      onOpen?.();
    };

    const handleClose = () => {
      setOpen(false);
      onClose?.();
    };

    useImperativeHandle(ref, () => ({
      open: handleOpen,
      close: handleClose,
    }));

    useSubscribe(event, () => {
      handleOpen();
    });

    return (
      <Dialog open={open} onClose={handleClose} fullWidth>
        {children}
      </Dialog>
    );
  }
);

EventPopup.displayName = "EventPopup";
