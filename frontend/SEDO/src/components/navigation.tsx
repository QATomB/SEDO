import { JSX, use } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../authentication/auth";

function NavDest({
  children,
  dest,
  long,
  admin,
  right,
}: {
  children: JSX.Element | string;
  dest: string;
  long?: boolean;
  admin?: boolean;
  right?: boolean;
}): JSX.Element {
  const length: string = long ? "w-50" : "w-20";
  const buttonBg: string = admin ? "bg-red-800" : "bg-blue-600";
  const s_right = right
    ? { marginLeft: "auto", order: 2, marginRight: "20px" }
    : {};
  return (
    <li
      className={`${length} px-4 my-0 ${buttonBg} text-slate-50 hover:bg-slate-300 hover:text-slate-900`}
      style={s_right}
    >
      <Link
        to={dest}
        className="flex items-center text-center justify-center h-full"
      >
        {children}
      </Link>
    </li>
  );
}

export default function NavBar(): JSX.Element {
  const { uname, access_level } = useAuth();
  return (
    <nav className="bg-blue-600">
      <ul className="h-14 p-0 pl-5 m-0 list-none flex space-x-2">
        <NavDest dest="/" long>
          Asset Managment
        </NavDest>
        <NavDest dest="/">Home</NavDest>
        <NavDest dest="/view">View</NavDest>
        <NavDest dest="/add">Add</NavDest>
        <NavDest dest="/create_new_movement" long>
          New Log
        </NavDest>
        {access_level > 1 ? (
          <NavDest dest="/users" admin>
            Users
          </NavDest>
        ) : (
          <></>
        )}
        <NavDest dest="/logout" long right>
          <span>
            Logout "<i>{uname}</i>"
          </span>
        </NavDest>
      </ul>
    </nav>
  );
}
