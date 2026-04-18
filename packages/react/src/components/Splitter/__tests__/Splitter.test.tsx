import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Splitter, SplitterPanel } from "../Splitter";

describe("Splitter", () => {
  it("renders two panels", () => {
    render(
      <Splitter>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
  });

  it("handle has role separator", () => {
    render(
      <Splitter>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("ArrowRight increases first panel size", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );

    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "50");

    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(handle).toHaveAttribute("aria-valuenow", "55");
  });

  it("ArrowDown increases first panel size", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );

    const handle = screen.getByRole("separator");
    handle.focus();
    await user.keyboard("{ArrowDown}");
    expect(handle).toHaveAttribute("aria-valuenow", "55");
  });

  it("ArrowLeft decreases first panel size", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );

    const handle = screen.getByRole("separator");
    handle.focus();
    await user.keyboard("{ArrowLeft}");
    expect(handle).toHaveAttribute("aria-valuenow", "45");
  });

  it("ArrowUp decreases first panel size", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );

    const handle = screen.getByRole("separator");
    handle.focus();
    await user.keyboard("{ArrowUp}");
    expect(handle).toHaveAttribute("aria-valuenow", "45");
  });

  // Wave 5d P0: controlled sizes
  it("respects controlled sizes prop", () => {
    render(
      <Splitter sizes={[30, 70]} onSizesChange={() => {}}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "30");
  });

  it("controlled sizes: onSizesChange fires but state does not update unless parent re-renders", async () => {
    const user = userEvent.setup();
    const onSizesChange = vi.fn();
    render(
      <Splitter sizes={[50, 50]} onSizesChange={onSizesChange}>
        <div>Panel 1</div>
        <div>Panel 2</div>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    handle.focus();
    await user.keyboard("{ArrowRight}");
    expect(onSizesChange).toHaveBeenCalledWith([55, 45]);
    // Controlled: valuenow stays at 50 because we didn't update the prop.
    expect(handle).toHaveAttribute("aria-valuenow", "50");
  });
});

// Phase 6H — Splitter P1 features
describe("Splitter P1 additions", () => {
  it("N-panel: renders 3 panels with 2 handles", () => {
    render(
      <Splitter>
        <SplitterPanel>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
        <SplitterPanel>C</SplitterPanel>
      </Splitter>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("N-panel: initial sizes sum to 100 when unspecified", () => {
    render(
      <Splitter>
        <SplitterPanel>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
        <SplitterPanel>C</SplitterPanel>
      </Splitter>,
    );
    const separators = screen.getAllByRole("separator");
    // Boundary 0 (left of B) controls A's size; boundary 1 controls B's size.
    const aSize = Number(separators[0].getAttribute("aria-valuenow"));
    const bSize = Number(separators[1].getAttribute("aria-valuenow"));
    // Each panel should be ~33.33 by default; final panel = 100 - a - b.
    expect(aSize).toBeCloseTo(33, 0);
    expect(bSize).toBeCloseTo(33, 0);
  });

  it("N-panel: defaultSizes prop distributes sizes across K panels", () => {
    render(
      <Splitter defaultSizes={[20, 30, 50]}>
        <SplitterPanel>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
        <SplitterPanel>C</SplitterPanel>
      </Splitter>,
    );
    const separators = screen.getAllByRole("separator");
    expect(separators[0]).toHaveAttribute("aria-valuenow", "20");
    expect(separators[1]).toHaveAttribute("aria-valuenow", "30");
  });

  it("per-panel minSize on SplitterPanel clamps drag", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <SplitterPanel minSize={40}>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuemin", "40");
    handle.focus();
    // Press ArrowLeft repeatedly; A should not go below 40.
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    const valuenow = Number(handle.getAttribute("aria-valuenow"));
    expect(valuenow).toBeGreaterThanOrEqual(40);
  });

  it("per-panel maxSize on SplitterPanel clamps drag", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]}>
        <SplitterPanel maxSize={60}>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuemax", "60");
    handle.focus();
    await user.keyboard(
      "{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}",
    );
    const valuenow = Number(handle.getAttribute("aria-valuenow"));
    expect(valuenow).toBeLessThanOrEqual(60);
  });

  it("collapsible panel: double-click collapses to collapsedSize", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[30, 70]}>
        <SplitterPanel collapsible>Sidebar</SplitterPanel>
        <SplitterPanel>Main</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    await user.dblClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "0");
  });

  it("collapsible panel: second double-click restores prior size", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[30, 70]}>
        <SplitterPanel collapsible>Sidebar</SplitterPanel>
        <SplitterPanel>Main</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    await user.dblClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "0");
    await user.dblClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "30");
  });

  it("collapsible: honors custom collapsedSize", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[30, 70]}>
        <SplitterPanel collapsible collapsedSize={5}>
          Sidebar
        </SplitterPanel>
        <SplitterPanel>Main</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    await user.dblClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "5");
  });

  it("non-collapsible panel: double-click does nothing", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[30, 70]}>
        <SplitterPanel>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    await user.dblClick(handle);
    expect(handle).toHaveAttribute("aria-valuenow", "30");
  });

  it("N-panel: boundary 0 only affects its two adjacent panels (panel C unchanged)", async () => {
    const user = userEvent.setup();
    const onSizesChange = vi.fn();
    render(
      <Splitter defaultSizes={[30, 30, 40]} onSizesChange={onSizesChange}>
        <SplitterPanel>A</SplitterPanel>
        <SplitterPanel>B</SplitterPanel>
        <SplitterPanel>C</SplitterPanel>
      </Splitter>,
    );
    const [h0] = screen.getAllByRole("separator");
    h0.focus();
    await user.keyboard("{ArrowRight}");
    // Dragging boundary 0 right: A grows, B shrinks, C stays at 40.
    const last = onSizesChange.mock.calls.at(-1)?.[0] as number[];
    expect(last[0]).toBe(35);
    expect(last[1]).toBe(25);
    expect(last[2]).toBe(40);
  });

  it("backward compat: raw children still work with top-level minSize", async () => {
    const user = userEvent.setup();
    render(
      <Splitter defaultSizes={[50, 50]} minSize={20}>
        <div>A</div>
        <div>B</div>
      </Splitter>,
    );
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuemin", "20");
    handle.focus();
    // Drive way below 20 to verify clamp.
    for (let k = 0; k < 10; k++) await user.keyboard("{ArrowLeft}");
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(20);
  });
});
