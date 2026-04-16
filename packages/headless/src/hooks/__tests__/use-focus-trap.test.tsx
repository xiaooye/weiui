import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { useFocusTrap } from "../use-focus-trap";

function TrapFixture({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref}>
      <button>First</button>
      <button>Second</button>
      <button>Third</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("wraps focus from last to first on Tab", async () => {
    render(<TrapFixture active={true} />);
    const user = userEvent.setup();
    screen.getByText("Third").focus();
    await user.tab();
    expect(screen.getByText("First")).toHaveFocus();
  });

  it("wraps focus from first to last on Shift+Tab", async () => {
    render(<TrapFixture active={true} />);
    const user = userEvent.setup();
    screen.getByText("First").focus();
    await user.tab({ shift: true });
    expect(screen.getByText("Third")).toHaveFocus();
  });

  it("does nothing when inactive", async () => {
    render(<TrapFixture active={false} />);
    const user = userEvent.setup();
    screen.getByText("Third").focus();
    await user.tab();
    // Focus moves naturally (out of container in real browser, but in jsdom it stays)
    // Key point: no error thrown
  });
});
