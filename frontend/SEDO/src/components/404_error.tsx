import { JSX } from "react";
import ErrorPage from "./error";
import { redirect } from "react-router-dom";

export default function PageNotFound(): JSX.Element {
  return <ErrorPage errorCode={404} desc="Page Not Found!" />;
}
