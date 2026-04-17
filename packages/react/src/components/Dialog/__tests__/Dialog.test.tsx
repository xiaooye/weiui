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
});
