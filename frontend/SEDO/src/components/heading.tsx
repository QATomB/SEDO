import { JSX } from "react";

export default function Heading({
  children,
}: {
  children: JSX.Element | string;
}): JSX.Element {
  return (
    <h1
      className="ml-[5%] mt-20 text-4xl text-slate-800 max-w-96 pb-3"
      style={{ borderBottom: "solid 2px black" }}
    >
      {children}
    </h1>
  );
}
