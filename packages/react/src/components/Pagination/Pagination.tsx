"use client";
import { forwardRef, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type PaginationSize = "sm" | "md" | "lg";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  /** Render first/last page jump buttons. */
  showFirstLast?: boolean;
  /** Render a jump-to-page input. */
  jumpInput?: boolean;
  /** Render a total items label. When a function, called with `(total, range)`. */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  /** Total number of items (required when `showTotal` is truthy). */
  total?: number;
  /** Current page size. Used with `showTotal` to compute ranges; also required for `pageSize`. */
  pageSize?: number;
  /** Page size selector options. Renders when provided. */
  pageSizeOptions?: number[];
  /** Called when user picks a different page size. */
  onPageSizeChange?: (size: number) => void;
  /** Size variant for the buttons. Default `md`. */
  size?: PaginationSize;
  className?: string;
}

function getPageRange(page: number, totalPages: number, siblings: number): (number | "...")[] {
  if (totalPages <= 5 + siblings * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: (number | "...")[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);

  range.push(1);
  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showFirstLast = false,
      jumpInput = false,
      showTotal = false,
      total,
      pageSize,
      pageSizeOptions,
      onPageSizeChange,
      size = "md",
      className,
    },
    ref,
  ) => {
    const pages = getPageRange(page, totalPages, siblingCount);
    const [jumpValue, setJumpValue] = useState("");

    const submitJump = () => {
      const n = parseInt(jumpValue, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) {
        onPageChange(n);
        setJumpValue("");
      }
    };

    const totalLabel = (() => {
      if (!showTotal) return null;
      if (total === undefined || pageSize === undefined) return null;
      const start = (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, total);
      if (typeof showTotal === "function") return showTotal(total, [start, end]);
      return `${start}–${end} of ${total}`;
    })();

    return (
      <nav
        ref={ref}
        className={cn("wui-pagination", className)}
        data-size={size}
        aria-label="Pagination"
      >
        {totalLabel !== null && (
          <span className="wui-pagination__total">{totalLabel}</span>
        )}
        {showFirstLast && (
          <button
            type="button"
            className="wui-pagination__btn"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            data-disabled={page <= 1 || undefined}
            aria-label="First page"
          >
            {"\u00AB"}
          </button>
        )}
        <button
          type="button"
          className="wui-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          data-disabled={page <= 1 || undefined}
          aria-label="Previous page"
        >
          &lsaquo;
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="wui-pagination__ellipsis" aria-hidden="true">
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className="wui-pagination__btn"
              data-active={p === page || undefined}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="wui-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          data-disabled={page >= totalPages || undefined}
          aria-label="Next page"
        >
          &rsaquo;
        </button>
        {showFirstLast && (
          <button
            type="button"
            className="wui-pagination__btn"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            data-disabled={page >= totalPages || undefined}
            aria-label="Last page"
          >
            {"\u00BB"}
          </button>
        )}
        {pageSizeOptions && onPageSizeChange && pageSize !== undefined && (
          <label className="wui-pagination__page-size">
            <span className="wui-pagination__page-size-label">Per page</span>
            <select
              className="wui-pagination__page-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
        {jumpInput && (
          <span className="wui-pagination__jump">
            <span className="wui-pagination__jump-label">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitJump();
                }
              }}
              onBlur={submitJump}
              className="wui-pagination__jump-input"
              aria-label="Jump to page"
            />
          </span>
        )}
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
