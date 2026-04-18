import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "../ButtonGroup";

describe("ButtonGroup", () => {
  it("renders children", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("has role group", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("applies wui-button-group class", () => {
    render(
      <ButtonGroup>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveClass("wui-button-group");
  });

  it("merges user className with base class", () => {
    render(
      <ButtonGroup className="custom-cls">
        <button>A</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveClass("wui-button-group");
    expect(group).toHaveClass("custom-cls");
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref}>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole("group"));
  });

  it("forwards arbitrary props (aria-label)", () => {
    render(
      <ButtonGroup aria-label="actions">
        <button>A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "actions" })).toBeInTheDocument();
  });
});
