import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("renders page buttons", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("current page has aria-current='page'", () => {
    render(<Pagination page={3} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getByText("3")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("1")).not.toHaveAttribute("aria-current");
  });

  it("clicking a page button calls onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={10} onPageChange={onPageChange} />);

    await user.click(screen.getByText("4"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("previous button is disabled on the first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("next button is disabled on the last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("shows ellipsis for large page counts", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={vi.fn()} />);
    const ellipses = screen.getAllByText("\u2026");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("does not show ellipsis for small page counts (totalPages <= 7)", () => {
    render(<Pagination page={4} totalPages={7} onPageChange={vi.fn()} />);
    expect(screen.queryByText("\u2026")).not.toBeInTheDocument();
    // All seven pages rendered
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it("previous button calls onPageChange with page - 1", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("next button calls onPageChange with page + 1", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  describe("first/last buttons (P1)", () => {
    it("shows First and Last buttons when showFirstLast", () => {
      render(<Pagination page={3} totalPages={10} onPageChange={vi.fn()} showFirstLast />);
      expect(screen.getByRole("button", { name: /first page/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /last page/i })).toBeInTheDocument();
    });

    it("First button jumps to page 1", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} showFirstLast />);
      await user.click(screen.getByRole("button", { name: /first page/i }));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("Last button jumps to the last page", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination page={3} totalPages={10} onPageChange={onPageChange} showFirstLast />);
      await user.click(screen.getByRole("button", { name: /last page/i }));
      expect(onPageChange).toHaveBeenCalledWith(10);
    });
  });

  describe("jumpInput (P1)", () => {
    it("renders a jump-to-page input", () => {
      render(<Pagination page={1} totalPages={20} onPageChange={vi.fn()} jumpInput />);
      expect(screen.getByRole("spinbutton", { name: /jump to page/i })).toBeInTheDocument();
    });

    it("pressing Enter jumps to the typed page", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination page={1} totalPages={20} onPageChange={onPageChange} jumpInput />);
      const input = screen.getByRole("spinbutton", { name: /jump to page/i });
      await user.type(input, "7");
      await user.keyboard("{Enter}");
      expect(onPageChange).toHaveBeenCalledWith(7);
    });

    it("ignores out-of-range values", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} jumpInput />);
      const input = screen.getByRole("spinbutton", { name: /jump to page/i });
      await user.type(input, "99");
      await user.keyboard("{Enter}");
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe("showTotal (P1)", () => {
    it("renders the default total label", () => {
      render(
        <Pagination page={2} totalPages={5} onPageChange={vi.fn()} pageSize={10} total={42} showTotal />,
      );
      expect(screen.getByText(/11–20 of 42/)).toBeInTheDocument();
    });

    it("renders a custom total label via function", () => {
      render(
        <Pagination
          page={2}
          totalPages={5}
          onPageChange={vi.fn()}
          pageSize={10}
          total={42}
          showTotal={(total, [s, e]) => `Showing ${s}..${e} (total ${total})`}
        />,
      );
      expect(screen.getByText(/Showing 11..20 \(total 42\)/)).toBeInTheDocument();
    });
  });

  describe("page size selector (P1)", () => {
    it("renders when pageSizeOptions + onPageSizeChange provided", () => {
      render(
        <Pagination
          page={1}
          totalPages={5}
          onPageChange={vi.fn()}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("combobox", { name: /rows per page/i })).toBeInTheDocument();
    });

    it("calls onPageSizeChange when selector changes", async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      render(
        <Pagination
          page={1}
          totalPages={5}
          onPageChange={vi.fn()}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={onPageSizeChange}
        />,
      );
      await user.selectOptions(
        screen.getByRole("combobox", { name: /rows per page/i }),
        "25",
      );
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
  });

  describe("size variants (P1)", () => {
    it("defaults to md", () => {
      const { container } = render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
      expect(container.querySelector(".wui-pagination")).toHaveAttribute("data-size", "md");
    });
    it("applies data-size attr for sm/lg", () => {
      const { container, rerender } = render(
        <Pagination page={1} totalPages={3} onPageChange={vi.fn()} size="sm" />,
      );
      expect(container.querySelector(".wui-pagination")).toHaveAttribute("data-size", "sm");
      rerender(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} size="lg" />);
      expect(container.querySelector(".wui-pagination")).toHaveAttribute("data-size", "lg");
    });
  });
});
