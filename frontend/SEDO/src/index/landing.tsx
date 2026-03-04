import { JSX } from "react";
import { Link } from "react-router-dom";
import Heading from "../components/heading";

import { useAuth } from "../authentication/auth";

export default function LandingComponent(): JSX.Element {
  const { access_level } = useAuth();
  const ulStyle =
    "w-[50%] bg-blue-200 text-slate-50 mx-auto mt-28 py-3 px-5 rounded-md";
  const liStyle =
    "flex h-20 my-7 text-center items-center justify-center align-middle rounded-md bg-blue-500";
  return (
    <>
      <Heading>All Options</Heading>
      <ul className={ulStyle}>
        <Link to="/view">
          <li className={liStyle}>View All Assets</li>
        </Link>
        <Link to="/add">
          <li className={liStyle}>Create New Asset Components</li>
        </Link>
        <Link to="/create_new_movement">
          <li className={liStyle}>Create New Asset Movement</li>
        </Link>
        {access_level > 1 ? (
          <Link to="/users">
            <li className={liStyle}>Manage Users</li>
          </Link>
        ) : (
          <></>
        )}
      </ul>
    </>
  );
}
