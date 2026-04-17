import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Splitter } from "../Splitter";

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
