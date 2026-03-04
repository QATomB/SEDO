import { JSX, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import CentreForm from "../components/centre_form";
import { useAuth } from "../authentication/auth";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface Asset {
  asset_uid: number;
  type: string;
}

interface Location {
  location_name: string;
  location_colour: string;
}

export default function CreateNewMovementPage(): JSX.Element {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<number | string>("");

  const [allLocations, setALlLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const navigate = useNavigate();
  const { token } = useAuth();

  const headers: Headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  useEffect(() => {
    const assetRequest: RequestInfo = new Request("https://sedo-backend.onrender.com/asset/", {
      method: "GET",
      headers: headers,
    });
    fetch(assetRequest).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          setAllAssets(json);
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
          setALlLocations(json);
        });
      } else {
        res.json().then((err) => {});
      }
    });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (selectedAsset == "" || selectedLocation == "") {
      alert("All Fields Must be Populated");
      return;
    }

    const movementRequest: RequestInfo = new Request("https://sedo-backend.onrender.com/asset/movements/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        asset_uid: selectedAsset,
        new_location: selectedLocation,
      }),
    });
    fetch(movementRequest).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          setALlLocations(json);
        });
      } else {
        res.json().then((err) => {});
      }
    });

    alert("Added specified movement");
    navigate("/view");
  };
  return (
    <CentreForm
      titleText="Create New Movement"
      submitText="Log Movement"
      onSubmit={handleSubmit}
    >
      <FormControl fullWidth>
        <InputLabel id="asset-selector-label">Select Asset UID</InputLabel>
        <Select
          labelId="asset-selector-label"
          id="asset-selector"
          value={selectedAsset}
          label="Select Asset  UID"
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
      <FormControl fullWidth>
        <InputLabel id="location-selector-label">
          Select New Location of Specified Asset
        </InputLabel>
        <Select
          labelId="location-selector-label"
          id="location-selector"
          value={selectedLocation}
          label="Select New Location of Specified Asset"
          variant="filled"
          onChange={(event) => {
            setSelectedLocation(event.target.value as string);
          }}
        >
          {allLocations.map((location) => (
            <MenuItem value={location.location_name}>
              {location.location_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </CentreForm>
  );
}
