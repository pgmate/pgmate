import { useState, useEffect } from "react";
import { useMatch } from "react-router-dom";
import { useDynamicQuery } from "hooks/use-query";

const BASE_ROUTES = ["", "home", "facts"];

export const useConnectionParams = () => {
  const match = useMatch("/:conn/:db?/*");
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  const query = useDynamicQuery({
    name: match?.params?.conn || "",
    database: match?.params?.db || "",
    username: "",
    desc: "",
    ssl: false,
    created_at: "",
    updated_at: "",
  });

  // Handles the initial connection check
  // (retrieves the version of the database)
  useEffect(() => {
    setError(null);
    setVersion(null);

    if (BASE_ROUTES.includes(match?.params?.conn || "")) {
      setReady(true);
    } else {
      setReady(false);

      query("select version() as version")
        .then((result) => {
          if (result[0]) {
            setVersion(result[0][0].version);
          } else {
            setError(result[1]?.response?.data?.message || result[1].message);
          }
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setReady(true);
        });
    }
  }, [match?.params?.conn]);

  return {
    ready,
    error,
    version,
    query,
    conn: match?.params.conn,
    db: match?.params.db,
  };
};
