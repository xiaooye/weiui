"use client";
import { forwardRef, useState, useRef, useMemo, useCallback, type ReactNode, type KeyboardEvent, type MouseEvent } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  type VisibilityState,
  type ColumnPinningState,
  type ColumnFiltersState,
  type ExpandedState,
  type ColumnSizingState,
  type OnChangeFn,
  type Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../utils/cn";

export type DataTableSize = "comfortable" | "dense";

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyText?: ReactNode;
  className?: string;
  /** Server-side mode: when true, the component will NOT apply pagination/sort/filter to `data`. */
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  /** Total row count for server-side pagination (required when manualPagination is true). */
  rowCount?: number;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onGlobalFilterChange?: OnChangeFn<string>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Loading state — renders a spinner row in the table body. */
  loading?: boolean;
  loadingText?: string;
  /** Size variant. `dense` uses reduced vertical padding. Default `comfortable`. */
  size?: DataTableSize;
  /** Sticky table header on scroll. */
  stickyHeader?: boolean;
  /** Enable column resizing (drag handle on header). */
  enableColumnResizing?: boolean;
  /** Enable column pinning (via column.meta.pinned or state). */
  enableColumnPinning?: boolean;
  /** Enable column visibility toggle menu. */
  enableColumnVisibility?: boolean;
  /** Enable per-column filter row. */
  enableColumnFilters?: boolean;
  /** Enable row expansion. Requires `renderSubRow` or `getRowCanExpand`. */
  enableExpanding?: boolean;
  /** Render the sub-row content when a row is expanded. */
  renderSubRow?: (row: Row<TData>) => ReactNode;
  /** Predicate for which rows can expand. Defaults to: all rows can expand when enableExpanding. */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  /** Enable row virtualization (non-paginated mode). */
  virtualize?: boolean;
  /** Estimated row height in px (used only when `virtualize`). Default 48. */
  estimatedRowHeight?: number;
  /** Visible viewport height for virtualized mode. Default 400px. */
  virtualHeight?: number;
  /** Click handler for rows. */
  onRowClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  /** Stable row id (enables selection persistence across pages). */
  getRowId?: (row: TData, index: number) => string;
  "data-testid"?: string;
}

function DataTableInner<TData>(
  {
    data,
    columns,
    searchable,
    searchPlaceholder = "Search...",
    selectable,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    emptyText = "No results.",
    className,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    rowCount,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onRowSelectionChange,
    loading = false,
    loadingText = "Loading...",
    size = "comfortable",
    stickyHeader = false,
    enableColumnResizing = false,
    enableColumnPinning = false,
    enableColumnVisibility = false,
    enableColumnFilters = false,
    enableExpanding = false,
    renderSubRow,
    getRowCanExpand,
    virtualize = false,
    estimatedRowHeight = 48,
    virtualHeight = 400,
    onRowClick,
    getRowId,
    "data-testid": dataTestId,
  }: DataTableProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: [], right: [] });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [visibilityMenuOpen, setVisibilityMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Build selection + expander columns — prepended to user columns.
  const finalColumns: ColumnDef<TData, unknown>[] = useMemo(() => {
    const cols: ColumnDef<TData, unknown>[] = [];
    if (selectable) {
      cols.push({
        id: "__wui_select__",
        size: 44,
        enableSorting: false,
        enableResizing: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select row ${row.id}`}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
          />
        ),
      });
    }
    if (enableExpanding) {
      cols.push({
        id: "__wui_expander__",
        size: 44,
        enableSorting: false,
        enableResizing: false,
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              type="button"
              className="wui-data-table__expander-btn"
              aria-label={row.getIsExpanded() ? `Collapse row ${row.id}` : `Expand row ${row.id}`}
              aria-expanded={row.getIsExpanded()}
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
            >
              {row.getIsExpanded() ? "\u25BE" : "\u25B8"}
            </button>
          ) : null,
      });
    }
    cols.push(...columns);
    return cols;
  }, [columns, selectable, enableExpanding]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination,
      columnVisibility,
      columnPinning,
      columnFilters,
      expanded,
      columnSizing,
    },
    getRowId,
    onSortingChange: (updater) => {
      setSorting(updater);
      onSortingChange?.(updater);
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater);
      onGlobalFilterChange?.(updater);
    },
    onRowSelectionChange: selectable
      ? (updater) => {
          setRowSelection(updater);
          onRowSelectionChange?.(updater);
        }
      : undefined,
    onPaginationChange: (updater) => {
      setPagination(updater);
      onPaginationChange?.(updater);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onColumnSizingChange: setColumnSizing,
    enableRowSelection: selectable,
    enableColumnResizing,
    enableColumnPinning,
    enableExpanding,
    getRowCanExpand: enableExpanding
      ? (getRowCanExpand ?? (() => true))
      : undefined,
    columnResizeMode: "onChange",
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount: manualPagination ? rowCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination || virtualize ? undefined : getPaginationRowModel(),
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
  });

  const pageCount = table.getPageCount();
  const totalColCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  // Virtualization (non-paginated mode only).
  const rowVirtualizer = useVirtualizer({
    count: virtualize ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualize && virtualRows.length > 0 ? virtualRows[0]!.start : 0;
  const paddingBottom =
    virtualize && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1]!.end
      : 0;

  const onGridKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableElement>) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const cell = target.closest<HTMLTableCellElement>("[data-wui-cell]");
      if (!cell) return;
      const tr = cell.parentElement as HTMLTableRowElement | null;
      if (!tr) return;
      const tbody = tr.parentElement;
      if (!tbody) return;
      const rowsNodes = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(":scope > tr[data-wui-row]"));
      const rowIdx = rowsNodes.indexOf(tr);
      const cellsNodes = Array.from(tr.querySelectorAll<HTMLTableCellElement>(":scope > [data-wui-cell]"));
      const colIdx = cellsNodes.indexOf(cell);

      const focusAt = (r: number, c: number) => {
        const targetRow = rowsNodes[r];
        if (!targetRow) return;
        const targetCell = targetRow.querySelectorAll<HTMLTableCellElement>(":scope > [data-wui-cell]")[c];
        if (targetCell) {
          e.preventDefault();
          targetCell.focus();
        }
      };

      switch (e.key) {
        case "ArrowDown": focusAt(rowIdx + 1, colIdx); break;
        case "ArrowUp": focusAt(rowIdx - 1, colIdx); break;
        case "ArrowRight": focusAt(rowIdx, colIdx + 1); break;
        case "ArrowLeft": focusAt(rowIdx, colIdx - 1); break;
        case "Home": focusAt(rowIdx, 0); break;
        case "End": focusAt(rowIdx, cellsNodes.length - 1); break;
      }
    },
    [],
  );

  const allLeafColumns = table.getAllLeafColumns().filter((c) => c.id !== "__wui_select__");

  return (
    <div
      ref={ref}
      className={cn(
        "wui-data-table",
        size === "dense" && "wui-data-table--dense",
        stickyHeader && "wui-data-table--sticky",
        className,
      )}
      data-loading={loading || undefined}
      data-size={size}
      data-testid={dataTestId}
    >
      {(searchable || enableColumnVisibility) && (
        <div className="wui-data-table__toolbar">
          {searchable && (
            <input
              className="wui-data-table__search"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                onGlobalFilterChange?.(e.target.value);
              }}
              aria-label="Search table"
            />
          )}
          {enableColumnVisibility && (
            <div className="wui-data-table__visibility">
              <button
                type="button"
                className="wui-data-table__visibility-trigger"
                aria-haspopup="menu"
                aria-expanded={visibilityMenuOpen}
                onClick={() => setVisibilityMenuOpen((s) => !s)}
              >
                Columns
              </button>
              {visibilityMenuOpen && (
                <div className="wui-data-table__visibility-menu" role="menu" aria-label="Toggle columns">
                  {allLeafColumns.map((col) => (
                    <label key={col.id} className="wui-data-table__visibility-item">
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={(e) => col.toggleVisibility(e.target.checked)}
                        aria-label={`Toggle column ${col.id}`}
                      />
                      <span>{typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div
        ref={scrollRef}
        className="wui-data-table__wrapper"
        style={virtualize ? { overflowY: "auto", maxBlockSize: virtualHeight } : undefined}
      >
        <table
          role="grid"
          aria-busy={loading || undefined}
          onKeyDown={onGridKeyDown}
          style={enableColumnResizing ? { inlineSize: table.getTotalSize() } : undefined}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isSelectCol = header.column.id === "__wui_select__";
                  const pin = header.column.getIsPinned();
                  const canResize = header.column.getCanResize();
                  return (
                    <th
                      key={header.id}
                      data-sortable={canSort || undefined}
                      data-select-col={isSelectCol || undefined}
                      data-pinned={pin || undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      style={
                        enableColumnResizing
                          ? { inlineSize: header.getSize() }
                          : undefined
                      }
                    >
                      <div className="wui-data-table__th-content">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span
                            className="wui-data-table__sort-icon"
                            data-active={sorted || undefined}
                            aria-hidden="true"
                          >
                            {sorted === "asc" ? "\u2191" : sorted === "desc" ? "\u2193" : "\u2195"}
                          </span>
                        )}
                        {enableColumnPinning && !isSelectCol && (
                          <span className="wui-data-table__pin-actions">
                            <button
                              type="button"
                              className="wui-data-table__pin-btn"
                              aria-label={`Pin column ${header.column.id} left`}
                              aria-pressed={pin === "left"}
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.pin(pin === "left" ? false : "left");
                              }}
                            >
                              {"\u25C0"}
                            </button>
                            <button
                              type="button"
                              className="wui-data-table__pin-btn"
                              aria-label={`Pin column ${header.column.id} right`}
                              aria-pressed={pin === "right"}
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.pin(pin === "right" ? false : "right");
                              }}
                            >
                              {"\u25B6"}
                            </button>
                          </span>
                        )}
                      </div>
                      {canResize && (
                        <span
                          className="wui-data-table__resizer"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize column ${header.column.id}`}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          data-resizing={header.column.getIsResizing() || undefined}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            {enableColumnFilters && (
              <tr className="wui-data-table__filter-row">
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const canFilter = header.column.getCanFilter() && header.column.id !== "__wui_select__";
                  return (
                    <th key={`f-${header.id}`} data-select-col={header.column.id === "__wui_select__" || undefined}>
                      {canFilter && (
                        <input
                          type="text"
                          className="wui-data-table__column-filter"
                          aria-label={`Filter ${header.column.id}`}
                          value={(header.column.getFilterValue() as string | undefined) ?? ""}
                          onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                          placeholder="Filter..."
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalColCount} className="wui-data-table__loading" aria-live="polite">
                  {loadingText}
                </td>
              </tr>
            ) : rows.length > 0 ? (
              <>
                {paddingTop > 0 && (
                  <tr aria-hidden="true" style={{ blockSize: paddingTop }}>
                    <td colSpan={totalColCount} style={{ padding: 0, border: 0 }} />
                  </tr>
                )}
                {(virtualize ? virtualRows.map((v) => rows[v.index]!) : rows).map((row) => (
                  <RowFragment<TData>
                    key={row.id}
                    row={row}
                    selectable={selectable ?? false}
                    onRowClick={onRowClick}
                    renderSubRow={renderSubRow}
                    enableExpanding={enableExpanding}
                  />
                ))}
                {paddingBottom > 0 && (
                  <tr aria-hidden="true" style={{ blockSize: paddingBottom }}>
                    <td colSpan={totalColCount} style={{ padding: 0, border: 0 }} />
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={totalColCount} className="wui-data-table__empty">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="wui-data-table__pagination">
        <div className="wui-data-table__page-size">
          <label htmlFor="wui-data-table-page-size">Rows per page:</label>
          <select
            id="wui-data-table-page-size"
            className="wui-data-table__page-size-select"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {pageSizeOptions.map((pSize) => (
              <option key={pSize} value={pSize}>
                {pSize}
              </option>
            ))}
          </select>
        </div>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, pageCount)}
        </span>
        <div className="wui-data-table__page-btns">
          <button
            type="button"
            className="wui-data-table__page-btn"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            data-disabled={!table.getCanPreviousPage() || undefined}
            aria-label="First page"
          >
            {"\u00AB"}
          </button>
          <button
            type="button"
            className="wui-data-table__page-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            data-disabled={!table.getCanPreviousPage() || undefined}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="wui-data-table__page-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            data-disabled={!table.getCanNextPage() || undefined}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <button
            type="button"
            className="wui-data-table__page-btn"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            data-disabled={!table.getCanNextPage() || undefined}
            aria-label="Last page"
          >
            {"\u00BB"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RowFragmentProps<TData> {
  row: Row<TData>;
  selectable: boolean;
  onRowClick?: (row: TData, event: MouseEvent<HTMLTableRowElement>) => void;
  renderSubRow?: (row: Row<TData>) => ReactNode;
  enableExpanding: boolean;
}

function RowFragment<TData>({ row, selectable, onRowClick, renderSubRow, enableExpanding }: RowFragmentProps<TData>) {
  const isExpanded = enableExpanding && row.getIsExpanded();
  const cells = row.getVisibleCells();
  return (
    <>
      <tr
        data-wui-row
        data-selected={row.getIsSelected() || undefined}
        aria-selected={selectable ? row.getIsSelected() : undefined}
        data-clickable={onRowClick ? "" : undefined}
        onClick={onRowClick ? (e) => onRowClick(row.original, e) : undefined}
      >
        {cells.map((cell) => {
          const isSelectCol = cell.column.id === "__wui_select__";
          const isExpanderCol = cell.column.id === "__wui_expander__";
          const pin = cell.column.getIsPinned();
          return (
            <td
              key={cell.id}
              data-wui-cell
              tabIndex={-1}
              data-select-col={isSelectCol || undefined}
              data-expander-col={isExpanderCol || undefined}
              data-pinned={pin || undefined}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
      {isExpanded && renderSubRow && (
        <tr className="wui-data-table__subrow" data-wui-subrow>
          <td colSpan={cells.length}>{renderSubRow(row)}</td>
        </tr>
      )}
    </>
  );
}

const DataTableForwarded = forwardRef(DataTableInner);
DataTableForwarded.displayName = "DataTable";

export const DataTable = DataTableForwarded as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
