import { useState, useEffect, createElement, ReactElement } from "react";
import { useApolloClient, useQuery, DocumentNode } from "@apollo/client";
import {
  Stack,
  Paper,
  Table as MuiTable,
  TableBody,
  TableContainer,
  TableHead,
  Button,
} from "@mui/material";

import { usePubSub } from "../../hooks/use-pubsub";
import { TablePagination } from "../TablePagination";
import { Icon } from "../Icon";
import { CodeBox } from "../CodeBox";
import { Form, FormField } from "../Form";
import { DrawerLayout } from "../DrawerLayout";
import { SearchBar } from "./SearchBar";
import { TableRow, TableRowProps } from "./TableRow";
import { TableHeader, TableHeaderProps } from "./TableHeader";

export interface TableProps<RowType extends Record<string, any>> {
  // Query Properties
  query: DocumentNode;
  rowsProp?: string;
  keyProp?: string;
  limit?: number;
  search?: boolean;
  variables?: Record<string, any>;

  activeId?: string;

  // Table Rendering
  headerComponent?: React.ComponentType<TableHeaderProps<RowType>> | false;
  rowComponent?: React.ComponentType<TableRowProps<RowType>>;

  // If provided, the click on the row will show details of the returned data.
  // The variable "id" with the row's id will be provided to the query.
  detailsProps?: Record<string, any>;
  detailsQuery?: DocumentNode;
  detailsTransform?: (data: any) => any;

  // Create New Entity
  createQuery?: DocumentNode;
  createFields?: FormField[];
  createDataTransform?: (data: any) => any;
  createDrawerProps?: Record<string, any>;
}

export const Table = <Row extends Record<string, any>>({
  // Query properties
  query,
  keyProp = "id",
  rowsProp = "rows",
  limit = 5,
  search = false,
  variables = {},
  ...otherProps
}: TableProps<Row>): ReactElement => {
  const pubsub = usePubSub();
  const apollo = useApolloClient();

  const [props, setProps] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, refetch } = useQuery(query, {
    variables: { search: "%", ...variables, limit, offset: 0 },
  });

  // Memoize the items to prevent flickering when opening a sub-route
  // It needs also to memoize the props to prevent rendering previous data with new components
  useEffect(() => {
    if (!data) return;
    setRows(data[rowsProp]);
    setProps(otherProps);
  }, [data]);

  useEffect(() => {
    setRows([]);
    setProps(null);
  }, [query, rowsProp, keyProp]);

  const handleSearchSubmit = (data: any) => {
    refetch({
      search: data.search.length ? `%${data.search}%` : "%",
      limit,
      offset: 0,
    });
  };

  const handleRowDisclose = async (row: Row) => {
    // Use a detail query if provided
    if (props.detailsQuery) {
      try {
        const res = await apollo.query({
          query: props.detailsQuery,
          variables: { id: row[keyProp] },
        });
        pubsub.emit("show::details", {
          body: <CodeBox data={props.detailsTransform(res.data)} />,
          ...props.detailsProps,
        });
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Display the entire row as fallback behavior
    pubsub.emit("show::details", {
      body: <CodeBox data={row} />,
      ...props.detailsProps,
    });
  };

  const handleCreateNewEntity = async (data: any) => {
    try {
      await apollo.mutate({
        mutation: props.createQuery,
        variables: props.createDataTransform
          ? props.createDataTransform(data)
          : data,
      });
      refetch();
      setCreateOpen(false);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  return (
    <>
      {(search || props?.createQuery) && (
        <Stack
          flex={1}
          direction="row"
          alignItems="center"
          spacing={10}
          mb={4}
          justifyContent={"right"}
        >
          {search && <SearchBar onSubmit={handleSearchSubmit} />}
          {props?.createQuery && (
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              sx={{
                height: 40, // Match the "Add" button's height
                minWidth: 40, // Ensure a consistent minimum width
                padding: "0 8px", // Adjust padding for size uniformity
                fontSize: "0.875rem", // Match font size
              }}
            >
              <Icon>add</Icon>
            </Button>
          )}
        </Stack>
      )}
      <TableContainer component={Paper}>
        <MuiTable size="small">
          <TableHead>
            {props &&
              props.headerComponent !== false &&
              rows &&
              createElement(props.headerComponent || TableHeader, {
                row: rows[0],
              })}
          </TableHead>
          <TableBody>
            {props &&
              rows
                .filter((row: Row) => row[keyProp as keyof Row])
                .map((row: Row) => {
                  return createElement(props.rowComponent || TableRow, {
                    key: row[keyProp as keyof Row] as string,
                    row,
                    rowProps: {
                      hover: true,
                      selected: props.activeId === row[keyProp as keyof Row],
                      sx: { "&:last-child td, &:last-child th": { border: 0 } },
                      onClick: () => handleRowDisclose(row),
                    },
                  });
                })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        onPageChange={(nextPage) =>
          refetch({
            offset: nextPage * limit,
          })
        }
        hasNextPage={data && data[rowsProp].length === limit}
      />
      <DrawerLayout
        {...props?.createDrawerProps}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      >
        <Form
          fields={props?.createFields}
          defaultValues={{}}
          onSubmit={handleCreateNewEntity}
        />
      </DrawerLayout>
    </>
  );
};

export { TableRow, TableCell } from "@mui/material";
