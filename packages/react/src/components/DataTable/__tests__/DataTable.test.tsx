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

describe("DataTable — first/last page buttons (P1)", () => {
  it("renders a First and Last page button", () => {
    render(<DataTable data={makeRows(50)} columns={columns} pageSize={10} />);
    expect(screen.getByRole("button", { name: /first page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /last page/i })).toBeInTheDocument();
  });

  it("Last page button jumps to the final page", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(50)} columns={columns} pageSize={10} />);
    await user.click(screen.getByRole("button", { name: /last page/i }));
    expect(screen.getByText(/page 5 of 5/i)).toBeInTheDocument();
  });

  it("First page returns to page 1", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(50)} columns={columns} pageSize={10} />);
    await user.click(screen.getByRole("button", { name: /last page/i }));
    await user.click(screen.getByRole("button", { name: /first page/i }));
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });
});

describe("DataTable — size variants (P1)", () => {
  it("defaults to comfortable size", () => {
    render(<DataTable data={makeRows(1)} columns={columns} data-testid="dt" />);
    expect(screen.getByTestId("dt")).toHaveAttribute("data-size", "comfortable");
  });

  it("applies dense class when size=dense", () => {
    render(<DataTable data={makeRows(1)} columns={columns} size="dense" data-testid="dt" />);
    const el = screen.getByTestId("dt");
    expect(el).toHaveAttribute("data-size", "dense");
    expect(el.className).toMatch(/wui-data-table--dense/);
  });
});

describe("DataTable — sticky header (P1)", () => {
  it("adds sticky class when stickyHeader", () => {
    render(<DataTable data={makeRows(1)} columns={columns} stickyHeader data-testid="dt" />);
    expect(screen.getByTestId("dt").className).toMatch(/wui-data-table--sticky/);
  });
});

describe("DataTable — row click handler (P1)", () => {
  it("fires onRowClick with row data", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable data={makeRows(2)} columns={columns} onRowClick={onRowClick} />);
    const rowsList = screen.getAllByRole("row");
    // rowsList[0] is header, rowsList[1] is first data row
    await user.click(rowsList[1]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]![0]).toEqual({ id: 1, name: "Row 1" });
  });

  it("marks clickable rows with data-clickable", () => {
    render(<DataTable data={makeRows(1)} columns={columns} onRowClick={() => {}} />);
    const dataRows = screen.getAllByRole("row").slice(1);
    expect(dataRows[0]).toHaveAttribute("data-clickable");
  });
});

describe("DataTable — empty state as ReactNode (P1)", () => {
  it("renders ReactNode emptyText", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        emptyText={<span data-testid="empty-slot">Nothing here</span>}
      />,
    );
    expect(screen.getByTestId("empty-slot")).toBeInTheDocument();
  });
});

describe("DataTable — column visibility (P1)", () => {
  it("shows Columns trigger when enableColumnVisibility", () => {
    render(
      <DataTable data={makeRows(1)} columns={columns} enableColumnVisibility />,
    );
    expect(screen.getByRole("button", { name: /columns/i })).toBeInTheDocument();
  });

  it("toggles a column visibility when checkbox clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable data={makeRows(1)} columns={columns} enableColumnVisibility />,
    );
    await user.click(screen.getByRole("button", { name: /columns/i }));
    const toggle = screen.getByRole("checkbox", { name: /toggle column name/i });
    await user.click(toggle);
    // Expect header "Name" to be hidden.
    expect(screen.queryByRole("columnheader", { name: /^Name$/i })).not.toBeInTheDocument();
  });
});

describe("DataTable — column pinning (P1)", () => {
  it("renders pin buttons when enableColumnPinning", () => {
    render(
      <DataTable data={makeRows(1)} columns={columns} enableColumnPinning />,
    );
    expect(screen.getByRole("button", { name: /pin column id left/i })).toBeInTheDocument();
  });

  it("toggles data-pinned on th when pinning", async () => {
    const user = userEvent.setup();
    render(
      <DataTable data={makeRows(1)} columns={columns} enableColumnPinning />,
    );
    await user.click(screen.getByRole("button", { name: /pin column id left/i }));
    const idHeader = screen.getByRole("columnheader", { name: /id/i });
    expect(idHeader).toHaveAttribute("data-pinned", "left");
  });
});

describe("DataTable — column filters (P1)", () => {
  it("renders a filter row when enableColumnFilters", () => {
    render(
      <DataTable data={makeRows(3)} columns={columns} enableColumnFilters />,
    );
    expect(screen.getByRole("textbox", { name: /filter id/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /filter name/i })).toBeInTheDocument();
  });

  it("filtering a column reduces visible rows", async () => {
    const user = userEvent.setup();
    render(
      <DataTable data={makeRows(5)} columns={columns} enableColumnFilters />,
    );
    const filter = screen.getByRole("textbox", { name: /filter name/i });
    await user.type(filter, "Row 3");
    const dataRows = screen.getAllByRole("row").slice(2); // minus header + filter row
    expect(dataRows).toHaveLength(1);
  });
});

describe("DataTable — column resizing (P1)", () => {
  it("renders a resizer on headers when enableColumnResizing", () => {
    render(
      <DataTable data={makeRows(1)} columns={columns} enableColumnResizing />,
    );
    const resizers = screen.getAllByRole("separator");
    expect(resizers.length).toBeGreaterThan(0);
  });
});

describe("DataTable — row expansion (P1)", () => {
  interface RowWithDetail {
    id: number;
    name: string;
    detail?: string;
  }
  const expCols: ColumnDef<RowWithDetail, unknown>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
  ];
  const expData: RowWithDetail[] = [
    { id: 1, name: "Row 1", detail: "extra 1" },
    { id: 2, name: "Row 2", detail: "extra 2" },
  ];

  it("renders expander buttons when enableExpanding", () => {
    render(
      <DataTable
        data={expData}
        columns={expCols}
        enableExpanding
        renderSubRow={(row) => <div data-testid="sub">{row.original.detail}</div>}
      />,
    );
    expect(screen.getAllByRole("button", { name: /expand row/i })).toHaveLength(2);
  });

  it("clicking expander renders sub-row", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        data={expData}
        columns={expCols}
        enableExpanding
        renderSubRow={(row) => <div data-testid="sub">{row.original.detail}</div>}
      />,
    );
    const expanders = screen.getAllByRole("button", { name: /expand row/i });
    await user.click(expanders[0]!);
    expect(screen.getByTestId("sub")).toHaveTextContent("extra 1");
  });
});

describe("DataTable — keyboard grid navigation (P1)", () => {
  it("ArrowDown moves focus to the cell below", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(3)} columns={columns} />);
    const cells = screen
      .getAllByRole("row")
      .slice(1)
      .flatMap((r) => Array.from(r.querySelectorAll<HTMLTableCellElement>("[data-wui-cell]")));
    cells[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(cells[2]).toHaveFocus(); // row 2 col 0
  });

  it("ArrowRight moves focus to the cell to the right", async () => {
    const user = userEvent.setup();
    render(<DataTable data={makeRows(1)} columns={columns} />);
    const cells = Array.from(
      screen.getAllByRole("row")[1]!.querySelectorAll<HTMLTableCellElement>("[data-wui-cell]"),
    );
    cells[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(cells[1]).toHaveFocus();
  });
});

describe("DataTable — virtualization (P1)", () => {
  it("renders only visible rows when virtualize", () => {
    const { container } = render(
      <DataTable
        data={makeRows(500)}
        columns={columns}
        virtualize
        estimatedRowHeight={40}
        virtualHeight={200}
      />,
    );
    // Virtualized: only a small subset of rows is rendered in the DOM.
    const rows = container.querySelectorAll("tr[data-wui-row]");
    expect(rows.length).toBeLessThan(500);
  });
});
