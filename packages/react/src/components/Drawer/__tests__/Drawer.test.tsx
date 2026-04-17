import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
