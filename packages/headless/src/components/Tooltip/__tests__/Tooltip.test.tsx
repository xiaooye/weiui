import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../Tooltip";
import { TooltipTrigger } from "../TooltipTrigger";
import { TooltipContent } from "../TooltipContent";

function TestTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <button>Hover me</button>
      </TooltipTrigger>
      <TooltipContent>Tooltip text</TooltipContent>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("does not show content initially", () => {
    render(<TestTooltip />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on hover", async () => {
    render(<TestTooltip />);
    await userEvent.setup().hover(screen.getByText("Hover me"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("hides on unhover", async () => {
    render(<TestTooltip />);
    const user = userEvent.setup();
    await user.hover(screen.getByText("Hover me"));
    await user.unhover(screen.getByText("Hover me"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("has role=tooltip on content", async () => {
    render(<TestTooltip />);
    await userEvent.setup().hover(screen.getByText("Hover me"));
    expect(screen.getByRole("tooltip")).toHaveAttribute("id");
  });

  it("sets aria-describedby on trigger when open", async () => {
    render(<TestTooltip />);
    const trigger = screen.getByText("Hover me");
    expect(trigger).not.toHaveAttribute("aria-describedby");
    await userEvent.setup().hover(trigger);
    expect(trigger).toHaveAttribute("aria-describedby");
  });
});
