import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, ButtonGroup, Tooltip } from "@mui/material";
import { Icon } from "components/Icon";

const options = [
  {
    mode: "data",
    label: "Data View",
    icon: "table_chart",
  },
  {
    mode: "info",
    label: "Info View",
    icon: "info",
  },
  {
    mode: "structure",
    label: "Structure View",
    icon: "edit",
  },
  {
    mode: "ddl",
    label: "DDL View",
    icon: "code",
  },
];

export function ToggleTableMode() {
  const navigate = useNavigate();
  const { conn, db, schema, table, mode } = useParams<{
    conn: string;
    db: string;
    schema: string;
    table: string;
    mode: string;
  }>();

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(
    options.findIndex((option) => option.mode === mode)
  );

  const handleMenuItemClick = (_: any, index: number) => {
    setSelectedIndex(index);
    navigate(`/${conn}/${db}/${schema}/${table}/${options[index].mode}`);
  };

  return (
    <Box
      flex={1}
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
      }}
    >
      <ButtonGroup variant="outlined" size="small" ref={anchorRef}>
        {options.map((option, index) => (
          <Tooltip key={option.mode} title={option.label}>
            <Button
              variant={index === selectedIndex ? "contained" : "outlined"}
              onClick={(event) => handleMenuItemClick(event, index)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1, // Add spacing between icon and label if needed
              }}
            >
              <Icon>{option.icon}</Icon>
            </Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Box>
  );
}
