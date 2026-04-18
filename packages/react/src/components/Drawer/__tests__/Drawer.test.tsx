import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
} from "../Drawer";

function TestDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>Head</DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("renders trigger but not content initially", () => {
    render(<TestDrawer />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByText("Head")).not.toBeInTheDocument();
  });

  it("renders content to document.body via Portal when open", async () => {
    const { container } = render(<TestDrawer />);
    await userEvent.setup().click(screen.getByText("Open"));
    const drawer = screen.getByRole("dialog");
    expect(container.contains(drawer)).toBe(false);
    expect(document.body.contains(drawer)).toBe(true);
  });

  it("closes on Escape", async () => {
    render(<TestDrawer />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies side modifier class", async () => {
    render(
      <Drawer side="left">
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>Head</DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    await userEvent.setup().click(screen.getByText("Open"));
    expect(screen.getByRole("dialog")).toHaveClass("wui-drawer--left");
  });
});

describe("Drawer P1 additions", () => {
  it("onInteractOutside preventable", async () => {
    const user = userEvent.setup();
    const onInteract = vi.fn((e: Event) => e.preventDefault());
    render(
      <>
        <Drawer defaultOpen>
          <DrawerContent onInteractOutside={onInteract}>Body</DrawerContent>
        </Drawer>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByTestId("outside"));
    expect(onInteract).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("onEscapeKeyDown preventable", async () => {
    const user = userEvent.setup();
    const onEsc = vi.fn((e: Event) => e.preventDefault());
    render(
      <Drawer defaultOpen>
        <DrawerContent onEscapeKeyDown={onEsc}>Body</DrawerContent>
      </Drawer>,
    );
    await user.keyboard("{Escape}");
    expect(onEsc).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("exposes data-state='open' on DrawerContent when open", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>Body</DrawerContent>
      </Drawer>,
    );
    const dlg = screen.getByRole("dialog");
    expect(dlg).toHaveAttribute("data-state", "open");
  });

  it("dismisses when user swipes past the 50px threshold toward close edge", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen onOpenChange={onChange} side="right">
        <DrawerContent>Body</DrawerContent>
      </Drawer>,
    );
    const dlg = screen.getByRole("dialog");
    await user.pointer([
      { keys: "[TouchA>]", target: dlg, coords: { clientX: 100, clientY: 50 } },
      { pointerName: "TouchA", target: dlg, coords: { clientX: 200, clientY: 50 } },
      { keys: "[/TouchA]", target: dlg, coords: { clientX: 200, clientY: 50 } },
    ]);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does NOT dismiss if pointer drag is a tiny tap (below threshold)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen onOpenChange={onChange} side="right">
        <DrawerContent>Body</DrawerContent>
      </Drawer>,
    );
    const dlg = screen.getByRole("dialog");
    // 3px movement — below both distance threshold AND too small to count
    // as a flick even at high velocity.
    await user.pointer([
      { keys: "[TouchA>]", target: dlg, coords: { clientX: 100, clientY: 50 } },
      { pointerName: "TouchA", target: dlg, coords: { clientX: 103, clientY: 50 } },
      { keys: "[/TouchA]", target: dlg, coords: { clientX: 103, clientY: 50 } },
    ]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does NOT dismiss when the drag direction is away from the close edge (capped)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen onOpenChange={onChange} side="right">
        <DrawerContent>Body</DrawerContent>
      </Drawer>,
    );
    const dlg = screen.getByRole("dialog");
    // side="right" closes to the right; dragging LEFT should be ignored.
    await user.pointer([
      { keys: "[TouchA>]", target: dlg, coords: { clientX: 200, clientY: 50 } },
      { pointerName: "TouchA", target: dlg, coords: { clientX: 50, clientY: 50 } },
      { keys: "[/TouchA]", target: dlg, coords: { clientX: 50, clientY: 50 } },
    ]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
