"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function getPageRange(page: number, totalPages: number, siblings: number): (number | "...")[] {
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
  ({ page, totalPages, onPageChange, siblingCount = 1, className }, ref) => {
    const pages = getPageRange(page, totalPages, siblingCount);

    return (
      <nav ref={ref} className={cn("wui-pagination", className)} aria-label="Pagination">
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
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
