"use client";
import { forwardRef, useState, type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { cn } from "../../utils/cn";

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
  /** Server-side mode: when true, the component will NOT apply pagination/sort/filter to `data`.
   * Consumer is responsible for passing pre-paginated/pre-sorted/pre-filtered rows, providing `rowCount`,
   * and reacting to onPaginationChange / onSortingChange / onGlobalFilterChange callbacks. */
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
    "data-testid": dataTestId,
  }: DataTableProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });

  // Build selection column if selectable — prepended to user columns.
  const finalColumns: ColumnDef<TData, unknown>[] = selectable
    ? [
        {
          id: "__wui_select__",
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
          enableSorting: false,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination,
    },
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
    enableRowSelection: selectable,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount: manualPagination ? rowCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();
  const totalColCount = finalColumns.length;

  return (
    <div
      ref={ref}
      className={cn("wui-data-table", className)}
      data-loading={loading || undefined}
      data-testid={dataTestId}
    >
      {searchable && (
        <div className="wui-data-table__toolbar">
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
        </div>
      )}
      <div className="wui-data-table__wrapper">
        <table role="grid" aria-busy={loading || undefined}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const isSelectCol = header.column.id === "__wui_select__";
                  return (
                    <th
                      key={header.id}
                      data-sortable={canSort || undefined}
                      data-select-col={isSelectCol || undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
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
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalColCount} className="wui-data-table__loading" aria-live="polite">
                  {loadingText}
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-selected={row.getIsSelected() || undefined}
                  aria-selected={selectable ? row.getIsSelected() : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelectCol = cell.column.id === "__wui_select__";
                    return (
                      <td key={cell.id} data-select-col={isSelectCol || undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
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
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
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
        </div>
      </div>
    </div>
  );
}

const DataTableForwarded = forwardRef(DataTableInner);
DataTableForwarded.displayName = "DataTable";

export const DataTable = DataTableForwarded as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
