import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppBar } from "../AppBar";

describe("AppBar", () => {
  it("renders children", () => {
    render(<AppBar>Top bar content</AppBar>);
    expect(screen.getByText("Top bar content")).toBeInTheDocument();
  });
});
