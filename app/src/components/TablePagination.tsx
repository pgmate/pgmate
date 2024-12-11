import { useState } from "react";
import { Stack, IconButton } from "@mui/material";

import { Icon } from "./Icon";

export type OnPageChange = (nextPage: number, prevPage: number) => void;

interface TablePaginationProps {
  onPageChange: OnPageChange;
  startPage?: number;
  hasNextPage?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  startPage,
  onPageChange,
  hasNextPage = true,
}) => {
  const [page, setPage] = useState(startPage || 0);

  return (
    <Stack direction={"row"} justifyContent={"flex-end"} mt={1}>
      <IconButton
        disabled={page === 0}
        onClick={() => {
          const prevPage = page;
          const nextPage = page - 1;
          setPage(nextPage);
          onPageChange(nextPage, prevPage);
        }}
      >
        <Icon>chevron_left</Icon>
      </IconButton>
      <IconButton
        disabled={hasNextPage === false}
        onClick={() => {
          const prevPage = page;
          const nextPage = page + 1;
          setPage(nextPage);
          onPageChange(nextPage, prevPage);
        }}
      >
        <Icon>chevron_right</Icon>
      </IconButton>
    </Stack>
  );
};
