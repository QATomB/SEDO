import { JSX, useState } from "react";
import TextField from "@mui/material/TextField";
import CentreForm from "../components/centre_form";
import { useAuth } from "./auth";
import { useNavigate } from "react-router-dom";

export default function RegisterForm(): JSX.Element {
  const [employee_id, setEmployee_id] = useState("");
  const [full_name, setFull_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { errors, register } = useAuth();
  const navigate = useNavigate();
  const handleRegister = (e: any) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords must match!");
    } else {
      register(employee_id, full_name, email, password);
      if (errors !== undefined) {
        navigate("/login");
      }
    }
  };
  return (
    <CentreForm
      titleText="Sign Up"
      submitText="Register Account"
      onSubmit={handleRegister}
    >
      <TextField
        id="employee_id"
        label="Employee ID"
        variant="filled"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmployee_id(event.target.value);
        }}
      />
      <br />
      <br />
      <TextField
        id="full_name"
        label="Full Name"
        variant="filled"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFull_name(event.target.value);
        }}
      />
      <br />
      <br />
      <TextField
        id="email"
        label="E-Mail"
        variant="filled"
        type="email"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(event.target.value);
        }}
      />
      <br />
      <br />
      <TextField
        id="password"
        label="Password"
        variant="filled"
        type="password"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPassword(event.target.value);
        }}
      />
      <br />
      <br />
      <TextField
        id="password"
        label="Confirm Password"
        variant="filled"
        type="password"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setConfirmPassword(event.target.value);
        }}
      />
    </CentreForm>
  );
}
