"use client";
import { forwardRef, useState } from "react";
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
} from "@tanstack/react-table";
import { cn } from "../../utils/cn";

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  pageSize?: number;
  emptyText?: string;
  className?: string;
}

function DataTableInner<TData>(
  {
    data,
    columns,
    searchable,
    searchPlaceholder = "Search...",
    selectable,
    pageSize = 10,
    emptyText = "No results.",
    className,
  }: DataTableProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: selectable ? setRowSelection : undefined,
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div ref={ref} className={cn("wui-data-table", className)}>
      {searchable && (
        <div className="wui-data-table__toolbar">
          <input
            className="wui-data-table__search"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            aria-label="Search table"
          />
        </div>
      )}
      <div className="wui-data-table__wrapper">
        <table role="grid">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const sortHandler = canSort ? header.column.getToggleSortingHandler() : undefined;
                  return (
                    <th
                      key={header.id}
                      data-sortable={canSort || undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      tabIndex={canSort ? 0 : undefined}
                      onClick={sortHandler}
                      onKeyDown={
                        canSort
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                sortHandler?.(e);
                              }
                            }
                          : undefined
                      }
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-selected={row.getIsSelected() || undefined}
                  aria-selected={selectable ? row.getIsSelected() : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="wui-data-table__empty">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="wui-data-table__pagination">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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

export const DataTable = forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
