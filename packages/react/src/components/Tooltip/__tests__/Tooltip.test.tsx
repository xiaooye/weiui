import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";

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
});
