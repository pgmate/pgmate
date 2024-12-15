import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Icon,
} from "@mui/material";
import { useSubscribe } from "../../hooks/use-pubsub";
import {
  useConnections,
  ConnectionItem,
  ConnectionData,
} from "./hooks/use-connections";
import { ConnectionsList } from "./components/ConnectionsList";
import {
  ConnectionForm,
  ConnectionFormApis,
} from "./components/ConnectionForm";

export const ConnectionsManager: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [editConnection, setEditConnection] = useState<ConnectionData | null>(
    null
  );
  const { connections, getConnectionData, deleteConnection, upsertConnection } =
    useConnections();
  const formRef = useRef<ConnectionFormApis>(null);

  useSubscribe("connections::manager", () => {
    setOpen(true);
  });

  const handleDisclose = (connection: ConnectionItem) => {
    navigate(`/${connection.name}`);
    setOpen(false);
  };

  const handleRequestDelete = (connection: ConnectionItem) => {
    if (!confirm(`Are you sure you want to delete "${connection.name}"?`))
      return;
    deleteConnection(connection);
  };

  const handleRequestEdit = (connection: ConnectionItem) => {
    getConnectionData(connection.name).then(setEditConnection);
  };

  const handleEditConnection = (data: ConnectionData) => {
    upsertConnection(data).then(() => setEditConnection(null));
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    handleRequestEdit({ name: "dw", desc: "dw" });
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      {editConnection === null && (
        <DialogTitle>Connections Manager</DialogTitle>
      )}
      {editConnection !== null && (
        <DialogTitle>
          <IconButton onClick={() => setEditConnection(null)} sx={{ mr: 1 }}>
            <Icon>arrow_back</Icon>
          </IconButton>
          Edit Connection: <b>{editConnection.name}</b>
        </DialogTitle>
      )}
      <DialogContent>
        {editConnection === null && (
          <ConnectionsList
            items={connections}
            onDisclose={handleDisclose}
            onRequestDelete={handleRequestDelete}
            onRequestEdit={handleRequestEdit}
          />
        )}
        {editConnection !== null && (
          <ConnectionForm
            ref={formRef}
            data={editConnection}
            onSave={handleEditConnection}
          />
        )}
      </DialogContent>
      {editConnection === null && (
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      )}
      {editConnection !== null && (
        <DialogActions>
          <Button onClick={() => setEditConnection(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => formRef.current?.save()}
            autoFocus
          >
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
