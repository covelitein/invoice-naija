"use client";

import { ChevronLeftIcon } from "@/components/app/icons";

export function Pagination({
  page,
  pageSize,
  totalPages,
  total,
  start,
  end,
  hasPrev,
  hasNext,
  onPageChange,
  noun = "items",
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  noun?: string;
}) {
  if (total <= 0) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-separator px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <p className="text-sm text-muted">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        {noun}
        <span className="text-border"> · </span>
        {pageSize} per page
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-4" />
          Prev
        </button>
        <p className="min-w-[4.5rem] text-center text-sm tabular-nums text-muted">
          <span className="font-medium text-foreground">{page}</span>
          <span className="mx-1">/</span>
          {totalPages}
        </p>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Next page"
        >
          Next
          <ChevronLeftIcon className="size-4 rotate-180" />
        </button>
      </div>
    </nav>
  );
}
