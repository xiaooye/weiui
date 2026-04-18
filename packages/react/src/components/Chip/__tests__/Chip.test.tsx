import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
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
    const ref = createRef<HTMLSpanElement>();
    render(<Chip ref={ref}>label</Chip>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  // E.9 icon + clickable + size + outlined + disabled
  it("renders icon slot before the label", () => {
    render(<Chip icon={<span data-testid="icon">X</span>}>React</Chip>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders as a button when onClick is provided", () => {
    render(<Chip onClick={() => {}}>Click me</Chip>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("does not render as a button when onClick is omitted", () => {
    render(<Chip>Static</Chip>);
    expect(screen.queryByRole("button", { name: /static/i })).not.toBeInTheDocument();
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Tap</Chip>);
    await user.click(screen.getByRole("button", { name: /tap/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies wui-chip--clickable when onClick provided", () => {
    render(<Chip onClick={() => {}}>Tap</Chip>);
    const el = screen.getByRole("button", { name: /tap/i });
    expect(el.className).toContain("wui-chip--clickable");
  });

  it("does not apply size class for md (default)", () => {
    render(<Chip>L</Chip>);
    const el = screen.getByText("L").closest(".wui-chip") as HTMLElement;
    expect(el.className).not.toContain("wui-chip--md");
  });

  it("applies sm size class", () => {
    render(<Chip size="sm">L</Chip>);
    const el = screen.getByText("L").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--sm");
  });

  it("applies lg size class", () => {
    render(<Chip size="lg">L</Chip>);
    const el = screen.getByText("L").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--lg");
  });

  it("applies outlined variant class", () => {
    render(<Chip variant="outlined">L</Chip>);
    const el = screen.getByText("L").closest(".wui-chip") as HTMLElement;
    expect(el.className).toContain("wui-chip--outlined");
  });

  it("disables button chip", () => {
    render(<Chip disabled onClick={() => {}}>L</Chip>);
    expect(screen.getByRole("button", { name: /l/i })).toBeDisabled();
  });

  it("disabled chip has data-disabled and aria-disabled", () => {
    render(<Chip disabled>L</Chip>);
    const el = screen.getByText("L").closest(".wui-chip") as HTMLElement;
    expect(el).toHaveAttribute("data-disabled");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });

  it("disabled chip hides remove button", () => {
    render(<Chip disabled onRemove={() => {}}>L</Chip>);
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });
});
