import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../DataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
];

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));
}

describe("DataTable — selectable UI (P0)", () => {
  it("renders a select-all checkbox in the header when selectable", () => {
    render(<DataTable data={makeRows(3)} columns={columns} selectable />);
    expect(screen.getByRole("checkbox", { name: /select all rows/i })).toBeInTheDocument();
  });

  it("renders a select checkbox per row when selectable", () => {
    render(<DataTable data={makeRows(3)} columns={columns} selectable />);
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /select row/i });
    expect(rowCheckboxes).toHaveLength(3);
  });

  it("clicking a row checkbox selects the row", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(2)} columns={columns} selectable />);
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /select row/i });
    await user.click(rowCheckboxes[0]!);
    expect(rowCheckboxes[0]).toBeChecked();
  });

  it("clicking select-all selects all visible rows", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(2)} columns={columns} selectable />);
    const selectAll = screen.getByRole("checkbox", { name: /select all rows/i });
    await user.click(selectAll);
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /select row/i });
    expect(rowCheckboxes[0]).toBeChecked();
    expect(rowCheckboxes[1]).toBeChecked();
  });

  it("does not render selection checkboxes when selectable=false", () => {
    render(<DataTable data={makeRows(3)} columns={columns} />);
    expect(screen.queryByRole("checkbox", { name: /select all rows/i })).not.toBeInTheDocument();
  });
});

describe("DataTable — page size selector (P0)", () => {
  it("renders a page size selector", () => {
    render(<DataTable data={makeRows(50)} columns={columns} />);
    expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
  });

  it("defaults to the pageSize prop", () => {
    render(<DataTable data={makeRows(50)} columns={columns} pageSize={20} />);
    const select = screen.getByLabelText(/rows per page/i) as HTMLSelectElement;
    expect(select.value).toBe("20");
  });

  it("changing the selector changes the number of rows rendered", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(50)} columns={columns} pageSize={10} />);
    const select = screen.getByLabelText(/rows per page/i);
    await user.selectOptions(select, "20");
    // Header + 20 data rows
    expect(screen.getAllByRole("row")).toHaveLength(21);
  });

  it("renders custom page size options", () => {
    render(<DataTable data={makeRows(100)} columns={columns} pageSizeOptions={[5, 25]} />);
    const select = screen.getByLabelText(/rows per page/i);
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(2);
    expect(options[0]?.value).toBe("5");
    expect(options[1]?.value).toBe("25");
  });
});

describe("DataTable — server-side mode (P0)", () => {
  it("manualPagination calls onPaginationChange when nextPage clicked", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    render(
      <DataTable
        data={makeRows(10)}
        columns={columns}
        manualPagination
        rowCount={100}
        onPaginationChange={onPaginationChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it("manualPagination reports total pages from rowCount", () => {
    render(
      <DataTable data={makeRows(10)} columns={columns} manualPagination rowCount={100} pageSize={10} />,
    );
    expect(screen.getByText(/page 1 of 10/i)).toBeInTheDocument();
  });

  it("manualSorting calls onSortingChange when header clicked", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    render(
      <DataTable
        data={makeRows(3)}
        columns={columns}
        manualSorting
        onSortingChange={onSortingChange}
      />,
    );
    await user.click(screen.getByRole("columnheader", { name: /id/i }));
    expect(onSortingChange).toHaveBeenCalled();
  });

  it("manualFiltering calls onGlobalFilterChange when searching", async () => {
    const user = userEvent.setup();
    const onGlobalFilterChange = vi.fn();
    render(
      <DataTable
        data={makeRows(3)}
        columns={columns}
        searchable
        manualFiltering
        onGlobalFilterChange={onGlobalFilterChange}
      />,
    );
    const search = screen.getByLabelText(/search table/i);
    await user.type(search, "X");
    expect(onGlobalFilterChange).toHaveBeenCalled();
  });
});

describe("DataTable — loading state (P0)", () => {
  it("renders loadingText when loading=true", () => {
    render(<DataTable data={[]} columns={columns} loading loadingText="Fetching..." />);
    expect(screen.getByText("Fetching...")).toBeInTheDocument();
  });

  it("sets aria-busy on the table when loading", () => {
    render(<DataTable data={[]} columns={columns} loading />);
    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "true");
  });

  it("sets data-loading on the root when loading", () => {
    render(<DataTable data={[]} columns={columns} loading data-testid="dt" />);
    expect(screen.getByTestId("dt")).toHaveAttribute("data-loading");
  });

  it("does not render loading text when loading=false", () => {
    render(<DataTable data={makeRows(1)} columns={columns} loadingText="Fetching..." />);
    expect(screen.queryByText("Fetching...")).not.toBeInTheDocument();
  });
});
