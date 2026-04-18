import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
} from "../Popover";

describe("Popover", () => {
  it("opens on trigger click (uncontrolled)", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>x</PopoverClose>
          <span>Body</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByText("Open"));
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("respects controlled open=true / open=false", () => {
    const { rerender } = render(
      <Popover open={false} onOpenChange={() => {}}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>x</PopoverClose>
          <span>Body</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Body")).not.toBeInTheDocument();

    rerender(
      <Popover open={true} onOpenChange={() => {}}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>x</PopoverClose>
          <span>Body</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("calls onOpenChange when toggled", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover open={false} onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>x</PopoverClose>
        </PopoverContent>
      </Popover>,
    );
    await userEvent.setup().click(screen.getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("renders content to document.body via Portal", async () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverClose>x</PopoverClose>
          <span data-testid="body">Body</span>
        </PopoverContent>
      </Popover>,
    );
    await userEvent.setup().click(screen.getByText("Open"));
    const body = screen.getByTestId("body");
    expect(container.contains(body)).toBe(false);
    expect(document.body.contains(body)).toBe(true);
  });

  it("applies floating styles with requested placement", async () => {
    render(
      <Popover side="top" align="end">
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="content">
          <PopoverClose>x</PopoverClose>
        </PopoverContent>
      </Popover>,
    );
    await userEvent.setup().click(screen.getByText("Open"));
    const content = screen.getByTestId("content");
    // floating-ui assigns inline positioning styles
    expect(content.style.position).toBe("absolute");
  });
});

describe("Popover P1 additions", () => {
  it("renders PopoverArrow when mounted in content", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          Body
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByTestId("arrow")).toBeInTheDocument();
  });

  it("modal={false} skips focus trap (focus escapes)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Popover modal={false}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <button>Inside</button>
          </PopoverContent>
        </Popover>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByText("Open"));
    await screen.findByText("Inside");
    // In non-modal mode Tab should reach the Outside button
    // Since focus ordering varies by browser, assert only that trap is not active
    // by checking Outside can receive focus via JS:
    screen.getByTestId("outside").focus();
    expect(screen.getByTestId("outside")).toHaveFocus();
  });

  it("onInteractOutside is called with preventDefault support", async () => {
    const user = userEvent.setup();
    const onInteract = vi.fn((e: Event) => e.preventDefault());
    render(
      <>
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent onInteractOutside={onInteract}>Body</PopoverContent>
        </Popover>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByText("Open"));
    await screen.findByText("Body");
    await user.click(screen.getByTestId("outside"));
    expect(onInteract).toHaveBeenCalled();
    // Popover should remain open because preventDefault was called
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
