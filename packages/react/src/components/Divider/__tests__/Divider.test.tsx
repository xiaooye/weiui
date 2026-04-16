import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Divider } from "../Divider";

describe("Divider", () => {
  it("renders an hr element", () => {
    const { container } = render(<Divider />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("applies wui-divider class", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveClass("wui-divider");
  });

  it("has aria-orientation horizontal by default", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("applies vertical class for vertical orientation", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstChild).toHaveClass("wui-divider--vertical");
  });

  it("has aria-orientation vertical when orientation is vertical", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstChild).toHaveAttribute("aria-orientation", "vertical");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLHRElement>;
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
  });
});
