import { useEffect, useCallback, useRef } from "react";
import { useAxios } from "hooks/use-axios";
import { usePubSub } from "hooks/use-pubsub";
import type { PGSchema } from "./pgschema.type";

export const useDbContext = (
  isReady: boolean,
  conn: string | undefined,
  database: string | undefined
) => {
  const axios = useAxios();
  const bus = usePubSub();
  const loopRef = useRef<number | null>(null);
  const dataRef = useRef<PGSchema | null>(null);

  // Fetches the schema and stores it in the ref
  const loop = useCallback(async () => {
    const res = await axios.post("/pg_schema", {
      conn,
      database,
    });

    dataRef.current = res.data?.schema as PGSchema;
    loopRef.current = window.setTimeout(loop, 1000);

    bus.emit("pgschema:updated", dataRef.current);
  }, [conn, database]);

  // Starts and stops the loop
  useEffect(() => {
    if (isReady && conn && database) {
      loop();
    } else {
      if (loopRef.current !== null) {
        window.clearTimeout(loopRef.current);
        dataRef.current = null;
        bus.emit("pgschema:updated", dataRef.current);
      }
    }

    return () => {
      if (loopRef.current !== null) {
        window.clearTimeout(loopRef.current);
        dataRef.current = null;
        bus.emit("pgschema:updated", dataRef.current);
      }
    };
  }, [isReady, conn, database, loop]);

  // Returns the ref with the data
  return () => dataRef.current;
};