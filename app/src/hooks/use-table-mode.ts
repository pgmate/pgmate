import { useMatch } from "react-router-dom";

export const useTableMode = () => {
  const match = useMatch("/:conn/:schema/:table/:mode/*");
  return { mode: match?.params.mode || "data" };
};
