import { JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function CentreForm({
  children,
  titleText,
  submitText,
  onSubmit,
}: {
  children: JSX.Element | JSX.Element[];
  titleText?: string;
  submitText?: string;
  onSubmit?: React.SubmitEventHandler<HTMLFormElement>;
}) {
  return (
    <Box
      component="form"
      // action={submissionURL}
      method="POST"
      sx={{
        width: "50vw",
        marginTop: "125px",
        marginInline: "auto",
        backgroundColor: "var(--cream-col)",
        borderRadius: "5px",
        overflow: "hidden",
      }}
      className="box-shadow"
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      {titleText ? (
        <h1 className="w-[50vw] h-20 mx-auto flex items-center text-center justify-center text-4xl bg-blue-500 text-slate-100">
          {titleText}
        </h1>
      ) : (
        <></>
      )}
      <div className="px-28 py-20 [&>*]:w-full">
        {children}
        <br />
        <br />
        <Button type="submit" variant="contained" sx={{ height: "50px" }}>
          {submitText ? submitText : "Submit"}
        </Button>
      </div>
    </Box>
  );
}
