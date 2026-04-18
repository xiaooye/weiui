import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../Dialog";

function TestDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog (react)", () => {
  it("renders content to document.body via Portal when open", async () => {
    const { container } = render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    const dialog = screen.getByRole("dialog");
    // dialog should not be a descendant of the initial render container
    expect(container.contains(dialog)).toBe(false);
    // dialog should be attached under document.body
    expect(document.body.contains(dialog)).toBe(true);
  });

  it("renders overlay backdrop when content open", async () => {
    const { baseElement } = render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    const overlay = baseElement.querySelector(".wui-dialog__overlay");
    expect(overlay).not.toBeNull();
  });

  it("applies wui-dialog__content class to content", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("wui-dialog__content");
  });

  it("DialogOverlay renders with wui-dialog__overlay class", () => {
    const { container } = render(<DialogOverlay data-testid="ov" />);
    expect(container.querySelector(".wui-dialog__overlay")).not.toBeNull();
  });

  it("Escape key closes the dialog", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByText("Open"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("locks body scroll when open and restores on close", async () => {
    const user = userEvent.setup();
    const originalOverflow = document.body.style.overflow;
    render(<TestDialog />);
    expect(document.body.style.overflow).toBe(originalOverflow);
    await user.click(screen.getByText("Open"));
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("focuses first focusable element when opened", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);
    await user.click(screen.getByText("Open"));
    // DialogClose is the first focusable button inside content
    expect(document.activeElement).toBe(screen.getByText("Close"));
  });
});
