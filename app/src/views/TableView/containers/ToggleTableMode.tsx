import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
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
    mode: "dll",

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

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(
    options.findIndex((option) => option.mode === mode)
  );

  const handleMenuItemClick = (
    _: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
    navigate(`/${conn}/${db}/${schema}/${table}/${options[index].mode}`);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup variant="outlined" size="small" ref={anchorRef}>
        <Button
          onClick={handleToggle}
          startIcon={<Icon>{options[selectedIndex].icon}</Icon>}
        >
          {options[selectedIndex].label}
        </Button>
        <Button onClick={handleToggle}>
          <Icon>arrow_drop_down</Icon>
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.mode}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      <Icon sx={{ mr: 2 }}>{option.icon}</Icon>
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
