import { useTableInfo } from "./hooks/use-table-info";
import { Dashboard } from "components/Dashboard";
import { ReadableSize } from "components/ReadableSize";

export const TableInfo = () => {
  const { stats } = useTableInfo();

  return (
    <Dashboard
      panels={[
        {
          label: "rows",
          primary: stats?.row_count,
        },
        {
          label: "Data Size",
          primary: <ReadableSize bytes={stats?.data_size} />,
          variant: "landscape",
        },
        {
          label: "Index Size",
          primary: <ReadableSize bytes={stats?.indexes_size} />,
          variant: "landscape",
        },
        {
          label: "Index vs Seq Scans",
          primary: stats?.idx_scan,
          secondary: stats?.seq_scan,
        },
        {
          label: "INSERTS",
          primary: stats?.inserts,
        },
        {
          label: "UPDATES",
          primary: stats?.updates,
        },
        {
          label: "DELETES",
          primary: stats?.deletes,
        },
        {
          label: "Owner",
          primary: stats?.table_owner,
        },
        {
          label: "Last AutoVacuum",
          primary: stats?.last_autovacuum || "Never",
        },
        {
          label: "Last AutoAnalyze",
          primary: stats?.last_autoanalyze || "Never",
        },
      ]}
    />
  );
};
