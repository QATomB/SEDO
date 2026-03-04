import { JSX, useEffect, useState } from "react";
import CentreForm from "../components/centre_form";
import Heading from "../components/heading";

import { useAuth } from "../authentication/auth";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function AddItemPage(): JSX.Element {
  // Input for New Asset Type
  const [newAssetType, setNewAssetType] = useState<string>("");

  // Input for New Location
  const [newLocation, setNewLocation] = useState<string>("");
  const [newLocationColour, setNewLocationColour] = useState<string>("");

  // Input for New Item
  const [chosenItemType, setChosenItemType] = useState<string>("");
  const [chosenLocation, setChosenLocation] = useState<string>("");

  // Hook for input in New Item
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [allItemTypes, setAllItemTypes] = useState<any[]>([]);

  const { token } = useAuth();

  function GenericPost(
    endpoint: string,
    body: any,
    provided_content_check: () => boolean,
    success_message?: string,
    processJson?: (json: any) => void,
  ) {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);

    const request: RequestInfo = new Request(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (provided_content_check()) {
      fetch(request).then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            if (success_message !== undefined) {
              alert(success_message);
            }
            if (processJson !== undefined) {
              processJson(json);
            }
          });
        } else {
          res.json().then((err) => {});
        }
      });
    } else {
      alert("Content must be provided");
    }
  }

  const handleNewAssetType = (e: any) => {
    e.preventDefault();

    GenericPost(
      "/api/asset/type/",
      { type: newAssetType },
      () => newAssetType != "",
      `Asset Type "${newAssetType}" Added`,
    );
  };

  const handleNewLocation = (e: any) => {
    e.preventDefault();

    GenericPost(
      "/api/asset/location/",
      {
        location_name: newLocation,
        location_colour: newLocationColour,
      },
      () => newLocation != "" && newLocationColour != "",
      `Location "${newLocation}" Added`,
    );
  };

  const handleNewItem = (e: any) => {
    e.preventDefault();

    GenericPost(
      "/api/asset/",
      {
        type: chosenItemType,
        location_name: chosenLocation,
      },
      () => chosenItemType != "" && chosenLocation != "",
      undefined,
      (json: any) => {
        alert(
          `New Item Created With UID of (${json}). Please Note This Custom Tag With The Asset`,
        );
      },
    );
  };

  function GenericGetList(endpoint: string, processRes: (json: any) => void) {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);

    const request: RequestInfo = new Request(endpoint, {
      method: "GET",
      headers: headers,
    });
    fetch(request).then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          processRes(json);
        });
      } else {
        res.json().then((err) => {});
      }
    });
  }

  useEffect(() => {
    GenericGetList("/api/asset/type/", (json: any) => setAllItemTypes(json));
    GenericGetList("/api/asset/location/", (json: any) =>
      setAllLocations(json),
    );
  }, []);

  return (
    <>
      <Heading>Add New Values</Heading>
      <CentreForm titleText="Register Assset" onSubmit={handleNewItem}>
        <FormControl fullWidth>
          <InputLabel id="all-item-types-label">All Item Types</InputLabel>
          <Select
            labelId="all-item-types-label"
            id="all-item-types"
            value={chosenItemType}
            label="All Item Types"
            variant="filled"
            onChange={(event) => {
              setChosenItemType(event.target.value as string);
            }}
          >
            {allItemTypes.map((itemType) => (
              <MenuItem value={itemType.type}>{itemType.type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <br />
        <br />
        <FormControl fullWidth>
          <InputLabel id="all-locations-label">All Locations</InputLabel>
          <Select
            labelId="all-locations-label"
            id="all-locations"
            value={chosenLocation}
            label="All Locations"
            variant="filled"
            onChange={(event) => {
              setChosenLocation(event.target.value as string);
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
      <CentreForm
        titleText="Register New Type Of Asset"
        onSubmit={handleNewAssetType}
      >
        <TextField
          id="type"
          label="New Item Type"
          variant="filled"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setNewAssetType(event.target.value);
          }}
        />
      </CentreForm>
      <CentreForm
        titleText="Register New Location"
        onSubmit={handleNewLocation}
      >
        <TextField
          id="location"
          label="New Location Name"
          variant="filled"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setNewLocation(event.target.value);
          }}
        />
        <br />
        <br />
        <FormControl fullWidth>
          <InputLabel id="new-location-colour-label">
            New Location Colour
          </InputLabel>
          <Select
            labelId="new-location-colour-label"
            id="new-location-colour"
            value={newLocationColour}
            label="New Location Colour"
            variant="filled"
            onChange={(event) => {
              setNewLocationColour(event.target.value as string);
            }}
          >
            <MenuItem value={"red"}>Red</MenuItem>
            <MenuItem value={"green"}>Green</MenuItem>
            <MenuItem value={"blue"}>Blue</MenuItem>
            <MenuItem value={"yellow"}>Yellow</MenuItem>
            <MenuItem value={"black"}>Black</MenuItem>
          </Select>
        </FormControl>
      </CentreForm>
    </>
  );
}
