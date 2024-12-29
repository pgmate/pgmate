import { Connection } from "../../../providers/ConnectionProvider";
import { useSchemas } from "../hooks/use-schemas";

interface SchemasListProps {
  conn: Connection;
}

export const SchemasList: React.FC<SchemasListProps> = ({ conn }) => {
  const { items } = useSchemas(conn);
  console.log(items);
  return null;
};
