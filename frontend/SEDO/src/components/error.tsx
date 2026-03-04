import { Link } from "react-router-dom";
import { JSX } from "react";

export default function ErrorPage({
  errorCode,
  desc,
}: {
  errorCode: number;
  desc: string;
}): JSX.Element {
  return (
    <h1 className="text-4xl items-center flex flex-row text-center justify-center h-[85vh]">
      <span>
        <span className="text-8xl">{errorCode}</span>
        <br />
        <br />
        <br />
        {desc}
        <br />
        <br />
        <Link to="/" className="underline">
          Go Home
        </Link>
      </span>
    </h1>
  );
}
