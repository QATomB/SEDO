import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useAuth } from "../authentication/auth";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

interface DBAssetEntry {
  movement_uid: number;
  asset: number;
  location: string;
  start_date: Date;
  end_date: Date | null;
}

interface Asset {
  asset_uid: number;
  type: string;
}

interface AssetEntry {
  movement_uid: number;
  asset_id: number;
  type: string;
  location: string;
  start_date: Date;
  end_date: Date;
}

const hospitalColours = {
  red: "#FFADAD",
  green: "#CAFFBF",
  blue: "#A0C4FF",
  yellow: "#FDFFB6",
  black: "#D3D3D3",
};

function AssetTables(): JSX.Element {
  const [dbMovements, setDbMovements] = useState<DBAssetEntry[]>([]);
  const [itemRows, setItemRows] = useState<AssetEntry[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<number | string>("");
  const [selectedAssetMovements, setSelectedAssetMovements] = useState<
    AssetEntry[]
  >([]);
  const [allLocations, setAllLocations] = useState({});

  const { token } = useAuth();
  const navigate = useNavigate();

  const headers: Headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  useEffect(() => {
    const request: RequestInfo = new Request("https://sedo-backend.onrender.com/asset/movements/", {
      method: "GET",
      headers: headers,
    });
    fetch(request).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          setDbMovements(json);
        });
      } else {
        res.json().then((err) => {});
      }
    });
    const locationRequest: RequestInfo = new Request("https://sedo-backend.onrender.com/asset/location/", {
      method: "GET",
      headers: headers,
    });
    fetch(locationRequest).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          let locAndCols = {};
          json.forEach(
            (location: { location_name: string; location_colour: string }) => {
              locAndCols = {
                ...locAndCols,
                ...{
                  [`${location.location_name.replace(" ", "_")}`]:
                    location.location_colour,
                },
              };
            },
          );
          setAllLocations(locAndCols);
        });
      } else {
        res.json().then((err) => {});
      }
    });
    const req: RequestInfo = new Request("https://sedo-backend.onrender.com/asset/", {
      method: "GET",
      headers: headers,
    });
    fetch(req).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          setAllAssets(Array.from(new Set(json)));
        });
      } else {
        res.json().then((err) => {});
      }
    });
  }, []);

  useEffect(() => {
    const allRows: AssetEntry[] = [];
    dbMovements.forEach((movement) => {
      let movementAssetType = "";
      allAssets.forEach((asset) => {
        if (movement.asset == asset.asset_uid) {
          movementAssetType = asset.type;
        }
      });
      const newRow = {
        movement_uid: movement.movement_uid,
        asset_id: movement.asset,
        type: movementAssetType,
        location: movement.location,
        start_date: new Date(movement.start_date),
        end_date: !movement.end_date
          ? new Date(Date.now())
          : new Date(movement.end_date),
      };
      allRows.push(newRow);
    });
    setItemRows(allRows);
  }, [dbMovements, allAssets]);

  useEffect(() => {
    setSelectedAssetMovements([]);
    if (selectedAsset) {
      itemRows.forEach((row) => {
        if (row.asset_id == selectedAsset) {
          setSelectedAssetMovements((selectedAssetMovements) => [
            ...selectedAssetMovements,
            row,
          ]);
        }
      });
    }
  }, [selectedAsset]);
  return (
    <div className="mt-[-100px]">
      <Button
        variant="contained"
        onClick={() => {
          navigate("/create_new_movement");
        }}
      >
        Add New Movement
      </Button>
      <br />
      <br />
      <br />
      <h2>Table of Selected Asset</h2>
      <br />
      <FormControl fullWidth>
        <InputLabel id="asset-selector-label">Select Asset By UID</InputLabel>
        <Select
          labelId="asset-selector-label"
          id="Select Asset UID"
          value={selectedAsset}
          label="Select Asset By UID"
          variant="filled"
          onChange={(event) => {
            setSelectedAsset(event.target.value as number);
          }}
        >
          {allAssets.map((asset) => (
            <MenuItem value={asset.asset_uid}>{asset.asset_uid}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <br />
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650, backgroundColor: "var(--cream-col)" }}
          className="box-shadow"
          size="small"
          aria-label="Table of Specific Assset"
        >
          <TableHead>
            <TableRow>
              <TableCell>Asset UID</TableCell>
              <TableCell>Asset Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedAssetMovements.map((row) => (
              <TableRow
                key={row.movement_uid}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.asset_id}
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell
                  sx={{
                    backgroundColor:
                      hospitalColours[
                        allLocations[row.location.replace(" ", "_")] as Colour
                      ],
                  }}
                >
                  {row.location}
                </TableCell>
                <TableCell>{row.start_date.toLocaleDateString()}</TableCell>
                <TableCell>{row.end_date.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <br />
      <br />
      <h2>Table of All Assets</h2>
      <br />
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650, backgroundColor: "var(--cream-col)" }}
          className="box-shadow"
          size="small"
          aria-label="Table of Assets"
        >
          <TableHead>
            <TableRow>
              <TableCell>Asset UID</TableCell>
              <TableCell>Asset Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemRows
              .sort((a, b) => a.start_date.getTime() - b.start_date.getTime())
              .reverse()
              .map((row) => (
                <TableRow
                  key={row.movement_uid}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.asset_id}
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        hospitalColours[
                          allLocations[row.location.replace(" ", "_")]
                        ],
                    }}
                  >
                    {row.location}
                  </TableCell>
                  <TableCell>{row.start_date.toLocaleDateString()}</TableCell>
                  <TableCell>{row.end_date.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default function ViewAssetTable(): JSX.Element {
  return (
    <div className="w-[90%] mx-auto py-40">
      <AssetTables />
    </div>
  );
}
