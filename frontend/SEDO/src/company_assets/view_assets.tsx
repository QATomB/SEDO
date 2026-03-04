import { JSX } from "react";
import ViewAssetTables from "../components/asset_tables";
import Heading from "../components/heading";

export default function ViewAssets(): JSX.Element {
  return (
    <>
      <Heading>View Assets</Heading>
      <ViewAssetTables></ViewAssetTables>
    </>
  );
}
