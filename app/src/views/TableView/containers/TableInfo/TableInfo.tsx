import Grid from "@mui/material/Grid2";
import { coalesce } from "components/Coalesce";
import { Dashboard } from "components/Dashboard";
import { ReadableSize } from "components/ReadableSize";
import { useTableInfo } from "./hooks/use-table-info";
import { UpstreamTree } from "./containers/UpstreamTree";
import { DownstreamTree } from "./containers/DownstreamTree";

export const TableInfo = () => {
  const { loading, stats } = useTableInfo();

  const panels = [
    coalesce(<UpstreamTree />, null),
    coalesce(<DownstreamTree />, null),
  ].filter(Boolean);

  return (
    <>
      {panels.length > 0 && (
        <Grid container spacing={2} sx={{ height: 250 }}>
          {!loading &&
            panels.map((panel, i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                {panel}
              </Grid>
            ))}
        </Grid>
      )}
      {stats && (
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
      )}
    </>
  );
};
