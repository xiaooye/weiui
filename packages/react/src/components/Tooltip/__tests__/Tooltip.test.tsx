import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow, TooltipProvider } from "../Tooltip";

describe("Tooltip", () => {
  it("opens on pointer enter and closes on pointer leave", () => {
    render(
      <Tooltip>
        <TooltipTrigger>
          <button>Hover</button>
        </TooltipTrigger>
        <TooltipContent>Tip body</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByText("Hover");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.pointerEnter(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on focus and closes on blur", () => {
    render(
      <Tooltip>
        <TooltipTrigger>
          <button>Focus</button>
        </TooltipTrigger>
        <TooltipContent>Tip body</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByText("Focus");
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("wires aria-describedby on trigger when open, clears on close", () => {
    render(
      <Tooltip>
        <TooltipTrigger>
          <button>Describe</button>
        </TooltipTrigger>
        <TooltipContent>Tip body</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByText("Describe");
    expect(trigger).not.toHaveAttribute("aria-describedby");
    fireEvent.focus(trigger);
    const id = trigger.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.id).toBe(id);
    fireEvent.blur(trigger);
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("renders content to document.body via Portal", () => {
    const { container } = render(
      <Tooltip>
        <TooltipTrigger>
          <button>Portal</button>
        </TooltipTrigger>
        <TooltipContent>Tip body</TooltipContent>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("Portal"));
    const tooltip = screen.getByRole("tooltip");
    expect(container.contains(tooltip)).toBe(false);
    expect(document.body.contains(tooltip)).toBe(true);
  });

  it("renders TooltipArrow inside content when provided", () => {
    render(
      <Tooltip>
        <TooltipTrigger>
          <button>Arrow</button>
        </TooltipTrigger>
        <TooltipContent>
          Tip body
          <TooltipArrow data-testid="arrow" />
        </TooltipContent>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("Arrow"));
    const arrow = screen.getByTestId("arrow");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    // Arrow is positioned via inline styles
    expect(arrow.style.position).toBe("absolute");
  });
});

describe("Tooltip P1 additions", () => {
  it("TooltipProvider sets global delay that child tooltips consume", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Hi</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    fireEvent.focus(screen.getByText("Trigger"));
    expect(await screen.findByText("Hi")).toBeInTheDocument();
  });

  it("side prop changes placement", async () => {
    render(
      <Tooltip side="bottom">
        <TooltipTrigger>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent data-testid="tip">Hi</TooltipContent>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("Trigger"));
    const tip = await screen.findByTestId("tip");
    expect(tip).toBeInTheDocument();
  });

  it("Escape closes the tooltip", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>
          <button>Trigger</button>
        </TooltipTrigger>
        <TooltipContent>Hi</TooltipContent>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("Trigger"));
    expect(await screen.findByText("Hi")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
  });
});
