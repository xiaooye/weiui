import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import { Spacer } from "../Spacer";

describe("Spacer", () => {
  it("renders a div", () => {
    const { container } = render(<Spacer />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("applies wui-spacer class", () => {
    const { container } = render(<Spacer />);
    expect(container.firstChild).toHaveClass("wui-spacer");
  });

  it("has aria-hidden true", () => {
    const { container } = render(<Spacer />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("merges custom className", () => {
    const { container } = render(<Spacer className="custom" />);
    expect(container.firstChild).toHaveClass("wui-spacer", "custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spacer ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
