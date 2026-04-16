import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "../Dialog";
import { DialogTrigger } from "../DialogTrigger";
import { DialogContent } from "../DialogContent";
import { DialogTitle } from "../DialogTitle";
import { DialogDescription } from "../DialogDescription";
import { DialogClose } from "../DialogClose";

function TestDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
        <button>Action</button>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("renders trigger but not content initially", () => {
    render(<TestDialog />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has correct ARIA attributes", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  it("closes on Escape", async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Close button click", async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focuses first focusable element on open", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open"));
    // First focusable inside content should have focus
    // (Action button or Close button depending on DOM order)
    expect(document.activeElement?.tagName).toBe("BUTTON");
  });

  it("traps focus within dialog", async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));

    // Tab through all focusable elements
    const closeBtn = screen.getByText("Close");
    closeBtn.focus();
    await user.tab();
    // Should wrap to first focusable (Action button)
    expect(screen.getByText("Action")).toHaveFocus();
  });

  it("returns focus to trigger on close", async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    const trigger = screen.getByText("Open");
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("trigger has aria-haspopup and aria-expanded", () => {
    render(<TestDialog />);
    const trigger = screen.getByText("Open");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("throws if compound components used outside Dialog", () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DialogTrigger>Bad</DialogTrigger>)).toThrow(
      "Dialog compound components must be used within <Dialog>"
    );
    spy.mockRestore();
  });
});
