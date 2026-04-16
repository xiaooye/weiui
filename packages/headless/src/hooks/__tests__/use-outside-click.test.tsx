import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRef } from "react";
import { useOutsideClick } from "../use-outside-click";

function ClickFixture({ handler, active }: { handler: () => void; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, handler, active);
  return (
    <div>
      <div ref={ref}><button>Inside</button></div>
      <button>Outside</button>
    </div>
  );
}

describe("useOutsideClick", () => {
  it("calls handler when clicking outside", () => {
    const handler = vi.fn();
    render(<ClickFixture handler={handler} active={true} />);
    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler when clicking inside", () => {
    const handler = vi.fn();
    render(<ClickFixture handler={handler} active={true} />);
    fireEvent.mouseDown(screen.getByText("Inside"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler when inactive", () => {
    const handler = vi.fn();
    render(<ClickFixture handler={handler} active={false} />);
    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(handler).not.toHaveBeenCalled();
  });
});
