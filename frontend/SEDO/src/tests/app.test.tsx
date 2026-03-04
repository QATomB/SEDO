import { render, screen } from "@testing-library/react";
import { App } from "../App";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

describe("App component", () => {
  it("Automatically directs to login page (app is working with security)", () => {
    render(<App />);
    const username = screen.getByLabelText("Employee ID");
    const password = screen.getByLabelText("Password");
    const button = screen.getByRole("button", { name: /Log In/i });
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});
