import { MouseEvent, ChangeEvent, useState, useEffect, useMemo } from "react";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useAuth } from "../authentication/auth";
import CentreForm from "./centre_form";
import { useNavigate } from "react-router-dom";

interface Data {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  accessLevel: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "employeeId",
    numeric: false,
    disablePadding: true,
    label: "Employee ID of user",
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Full Name",
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "E-Mail",
  },
  {
    id: "accessLevel",
    numeric: false,
    disablePadding: false,
    label: "Access Level",
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: keyof Data) => (event: MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number;
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Users Table
        </Typography>
      )}
    </Toolbar>
  );
}
export default function UserTable() {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Data>("employeeId");
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState<Data | null>(null);

  const [rows, setRows] = useState<Data[]>([]);

  const [editableEmployeeID, setEditableEmployeeID] = useState<string>("");
  const [editableEmail, setEditableEmail] = useState<string>("");
  const [editableFullName, setEditableFullName] = useState<string>("");
  const [editablePassword, setEditablePassword] = useState<string>("");
  const [editableAccessLevel, setEditableAccessLevel] = useState<
    number | string
  >("");

  const { token } = useAuth();
  const navigate = useNavigate();

  const headers: Headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  useEffect(() => {
    const request: RequestInfo = new Request("/api/users/", {
      method: "GET",
      headers: headers,
    });
    fetch(request).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          json.forEach((usr: any) => {
            setRows((rows) => [
              ...rows,
              {
                id: rows.length,
                employeeId: usr.employee_id,
                name: usr.full_name,
                email: usr.email,
                accessLevel: usr.access_level == 2 ? "Admin" : "User",
              } as Data,
            ]);
          });
        });
      } else {
        res.json().then((err) => {});
      }
    });
  }, []);

  const handleRequestSort = (
    event: MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    setSelected([]);
    setSelectedUser(null);
  };

  const handleClick = (event: MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    if (selectedIndex === -1) {
      setSelected([id]);
      let selectedUser: Data = rows[id];
      setSelectedUser(selectedUser);
    } else {
      setSelected([]);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    // Truthy check
    if (selectedUser) {
      setEditableEmployeeID(selectedUser.employeeId);
      setEditableEmail(selectedUser.email);
      setEditableFullName(selectedUser.name);
      setEditablePassword("");
      setEditableAccessLevel(selectedUser.accessLevel == "Admin" ? 2 : 1);
    }
  }, [selectedUser]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rows, rowsPerPage],
  );

  return (
    <div>
      {selectedUser === null ? (
        <></>
      ) : (
        <div className="mt-[-150px]">
          <CentreForm
            titleText="Edit User"
            submitText="Update User"
            onSubmit={(e: any) => {
              e.preventDefault();
              const updateUserReq: RequestInfo = new Request(
                `/api/users/${selectedUser.employeeId}/`,
                {
                  method: "PUT",
                  headers: headers,
                  body: JSON.stringify({
                    employee_id: editableEmployeeID,
                    email: editableEmail,
                    full_name: editableFullName,
                    access_level: editableAccessLevel,
                    unhashed_password: editablePassword,
                  }),
                },
              );
              fetch(updateUserReq).then((res) => {
                if (res.ok) {
                  res.json().then((json) => {
                    navigate("/users");
                  });
                } else {
                  res.json().then((err) => {
                    if (res.status == 412) {
                      alert(err.detail);
                    }
                  });
                }
              });
            }}
          >
            <TextField
              id="edit-employee_id"
              label="Employee ID"
              variant="filled"
              value={editableEmployeeID}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditableEmployeeID(event.target.value);
              }}
            />
            <br />
            <br />
            <TextField
              id="edit-email"
              label="E-Mail"
              variant="filled"
              value={editableEmail}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditableEmail(event.target.value);
              }}
            />
            <br />
            <br />
            <TextField
              id="edit-full-name"
              label="Full Name"
              variant="filled"
              value={editableFullName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditableFullName(event.target.value);
              }}
            />
            <br />
            <br />
            <TextField
              id="edit-password"
              label="Password"
              variant="filled"
              type="password"
              value={editablePassword}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditablePassword(event.target.value);
              }}
            />
            <br />
            <br />
            <FormControl fullWidth>
              <InputLabel id="edit-access-level-label">Access Level</InputLabel>
              <Select
                labelId="edit-access-level-label"
                id="edit-access-level"
                value={editableAccessLevel}
                label="Access Level"
                variant="filled"
                onChange={(event) => {
                  setEditableAccessLevel(event.target.value as string);
                }}
              >
                <MenuItem value={1}>User</MenuItem>
                <MenuItem value={2} sx={{ backgroundColor: "#d56" }}>
                  Admin
                </MenuItem>
              </Select>
            </FormControl>
            <br />
            <br />
            <Button
              variant="contained"
              sx={{ height: "50px", backgroundColor: "#c43" }}
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete user "${editableFullName}"`,
                  )
                ) {
                  const delteUserReq: RequestInfo = new Request(
                    `/api/users/${selectedUser.employeeId}/`,
                    {
                      method: "DELETE",
                      headers: headers,
                    },
                  );
                  fetch(delteUserReq).then((res) => {
                    if (res.ok) {
                      res.json().then((json) => {
                        navigate("/");
                      });
                    } else {
                      res.json().then((err) => {});
                    }
                  });
                }
              }}
            >
              Delete User
            </Button>
          </CentreForm>
          <br />
          <br />
        </div>
      )}
      <Box sx={{ width: "100%" }}>
        <Paper
          sx={{ width: "100%", mb: 2, backgroundColor: "var(--cream-col2)" }}
        >
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-label="Table of Users"
              aria-labelledby="tableTitle"
              size="medium"
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.employeeId}
                      </TableCell>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">{row.accessLevel}</TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 53 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </div>
  );
}
