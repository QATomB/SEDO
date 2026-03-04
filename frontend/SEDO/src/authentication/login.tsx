import { JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import CentreForm from "../components/centre_form";
import { useAuth } from "./auth";

export default function LoginForm(): JSX.Element {
  const [employee_id, setEmployee_id] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = (e: any) => {
    e.preventDefault();
    login(employee_id, password);
    navigate("/view");
  };
  return (
    <CentreForm titleText="Login" submitText="Log In" onSubmit={handleLogin}>
      <div className="mt-[-40px] mb-[50px] underline">
        <Link to={"/register"}>Or Register Here!</Link>
      </div>
      <TextField
        id="employee_id"
        label="Employee ID"
        variant="filled"
        value={employee_id}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmployee_id(event.target.value);
        }}
      />
      <br />
      <br />
      <TextField
        id="password"
        label="Password"
        variant="filled"
        type="password"
        value={password}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value);
        }}
      />
    </CentreForm>
  );
}
