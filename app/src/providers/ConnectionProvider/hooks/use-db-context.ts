import { useEffect, useCallback, useRef } from "react";
import { useAxios } from "hooks/use-axios";
import { usePubSub, useSubscribe } from "hooks/use-pubsub";
import type { DBInfo } from "./pgschema.type";

/**
 * TODO: we should also accept an event to interrupt the loop and force an update.
 *       it would be useful in association with the SQL Editor that detects a change in schema command.
 */
const POLL_INTERVAL = 30000;

export const useDbContext = (
  isReady: boolean,
  conn: string | undefined,
  database: string | undefined
) => {
  const axios = useAxios();
  const bus = usePubSub();
  const loopRef = useRef<number | null>(null);
  const dataRef = useRef<DBInfo | null>(null);

  // Fetches the schema and stores it in the ref
  const loop = useCallback(async () => {
    const res = await axios.post(
      "/pg_schema",
      {},
      {
        headers: {
          "x-pgmate-conn": conn,
          "x-pgmate-db": database,
        },
      }
    );

    dataRef.current = res.data as DBInfo;
    loopRef.current = window.setTimeout(loop, POLL_INTERVAL);

    bus.emit("dbinfo:updated", dataRef.current);
  }, [conn, database]);

  // Starts and stops the loop
  useEffect(() => {
    if (isReady && conn && database) {
      loop();
    } else {
      if (loopRef.current !== null) {
        window.clearTimeout(loopRef.current);
        dataRef.current = null;
        bus.emit("dbinfo:updated", dataRef.current);
      }
    }

    return () => {
      if (loopRef.current !== null) {
        window.clearTimeout(loopRef.current);
        dataRef.current = null;
        bus.emit("dbinfo:updated", dataRef.current);
      }
    };
  }, [isReady, conn, database, loop]);

  useSubscribe("dbinfo:refresh", () => {
    loopRef.current && window.clearTimeout(loopRef.current);
    loop();
  });

  // Returns the ref with the data
  return () => dataRef.current;
};
