import { useURLConnection } from "hooks/use-connections";
import { useDynamicQuery } from "hooks/use-query";
import { usePubSub } from "hooks/use-pubsub";

export const useCreateSchema = () => {
  const bus = usePubSub();
  const conn = useURLConnection();
  const query = useDynamicQuery(conn!);

  return async (values: any) => {
    await query(`CREATE SCHEMA ${values.name};`);
    bus.emit("dbinfo:refresh");

    if (values.desc) {
      await query(`COMMENT ON SCHEMA ${values.name} IS '${values.desc}';`);
    }

    return `${conn?.name}/${conn?.database}/${values.name}`;
  };
};
