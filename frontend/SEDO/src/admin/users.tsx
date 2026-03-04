import { JSX } from "react";

import Heading from "../components/heading";
import UserTable from "../components/user_table";

export default function UserManagment(): JSX.Element {
  return (
    <>
      <Heading>Users</Heading>
      <div className="w-[90%] mx-auto py-20">
        <UserTable />
      </div>
    </>
  );
}
