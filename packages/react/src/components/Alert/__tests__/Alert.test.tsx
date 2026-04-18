import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertTitle, AlertDescription } from "../Alert";

describe("Alert", () => {
  it("has role=alert", () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(
      <Alert>
        <AlertTitle>Title text</AlertTitle>
        <AlertDescription>Description text</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Title text")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("applies variant class for destructive", () => {
    render(<Alert variant="destructive">Error</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("wui-alert--destructive");
  });

  it("applies variant class for success", () => {
    render(<Alert variant="success">Success</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("wui-alert--success");
  });

  it("applies variant class for warning", () => {
    render(<Alert variant="warning">Warning</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("wui-alert--warning");
  });

  it("default variant is info", () => {
    render(<Alert>Info</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("wui-alert--info");
  });

  // E.11 icon + dismissible + action
  it("renders a default icon for each variant", () => {
    const { rerender } = render(<Alert>i</Alert>);
    expect(screen.getByRole("alert").querySelector(".wui-alert__icon")).toBeInTheDocument();
    rerender(<Alert variant="success">s</Alert>);
    expect(screen.getByRole("alert").querySelector(".wui-alert__icon")).toBeInTheDocument();
    rerender(<Alert variant="warning">w</Alert>);
    expect(screen.getByRole("alert").querySelector(".wui-alert__icon")).toBeInTheDocument();
    rerender(<Alert variant="destructive">d</Alert>);
    expect(screen.getByRole("alert").querySelector(".wui-alert__icon")).toBeInTheDocument();
  });

  it("custom icon overrides the default", () => {
    render(<Alert icon={<span data-testid="custom-icon">!</span>}>msg</Alert>);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("icon={null} hides the icon", () => {
    render(<Alert icon={null}>msg</Alert>);
    expect(screen.getByRole("alert").querySelector(".wui-alert__icon")).not.toBeInTheDocument();
  });

  it("does not render close button by default", () => {
    render(<Alert>msg</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("renders close button when dismissible", () => {
    render(<Alert dismissible>msg</Alert>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("dismissing hides the alert and calls onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Alert dismissible onDismiss={onDismiss}>msg</Alert>);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders action slot content", () => {
    render(<Alert action={<button>Retry</button>}>msg</Alert>);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
