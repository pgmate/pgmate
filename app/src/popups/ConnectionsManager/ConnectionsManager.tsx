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
  Stack,
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
  const [open, setOpen] = useState(false);
  const formRef = useRef<ConnectionFormApis>(null);
  const { connections, getConnectionData, deleteConnection, upsertConnection } =
    useConnections();
  const [editConnection, setEditConnection] = useState<ConnectionData | null>(
    null
  );

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

  const handleRequestNew = () => {
    setEditConnection({
      name: "",
      desc: "",
      conn: {
        host: "localhost",
        port: 5432,
        user: "",
        password: "",
        database: "",
      },
      ssl: false,
      created_at: "",
      updated_at: "",
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      {editConnection === null && (
        <DialogTitle>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <span>Connections Manager</span>
            <IconButton onClick={handleRequestNew}>
              <Icon>add</Icon>
            </IconButton>
          </Stack>
        </DialogTitle>
      )}
      {editConnection !== null && (
        <DialogTitle>
          <IconButton onClick={() => setEditConnection(null)} sx={{ mr: 1 }}>
            <Icon>arrow_back</Icon>
          </IconButton>
          {editConnection.name ? (
            <>
              Edit Connection: <b>{editConnection.name}</b>
            </>
          ) : (
            "New Connection"
          )}
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
