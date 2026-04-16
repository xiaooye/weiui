import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "../Chip";

describe("Chip", () => {
  it("renders text content", () => {
    render(<Chip>React</Chip>);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("applies wui-chip class", () => {
    render(<Chip>label</Chip>);
    expect(screen.getByText("label").closest(".wui-chip")).toBeInTheDocument();
  });

  it("does not show remove button when onRemove is not provided", () => {
    render(<Chip>label</Chip>);
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("shows remove button when onRemove is provided", () => {
    render(<Chip onRemove={() => {}}>label</Chip>);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>label</Chip>);
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("applies color variant class", () => {
    render(<Chip color="primary">label</Chip>);
    const el = screen.getByText("label").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--primary");
  });

  it("does not apply default color class", () => {
    render(<Chip>label</Chip>);
    const el = screen.getByText("label").closest(".wui-chip") as HTMLElement;
    expect(el.className).not.toContain("wui-chip--default");
  });

  it("applies success color class", () => {
    render(<Chip color="success">label</Chip>);
    const el = screen.getByText("label").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--success");
  });

  it("applies destructive color class", () => {
    render(<Chip color="destructive">label</Chip>);
    const el = screen.getByText("label").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--destructive");
  });

  it("merges custom className", () => {
    render(<Chip className="extra">label</Chip>);
    const el = screen.getByText("label").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLSpanElement>;
    render(<Chip ref={ref}>label</Chip>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
