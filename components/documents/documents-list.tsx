"use client";

import { FilterIcon, PlusIcon, SearchIcon } from "@/components/app/icons";
import { StatusChip } from "@/components/dashboard/status-chip";
import { DocumentsScene } from "@/components/illustrations/scenes";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { apiGet } from "@/lib/api-client";
import type { DashboardDocument, DocumentStatus } from "@/lib/dashboard-data";
import {
  listSavedDocuments,
  savedToDashboard,
  type SavedDocument,
} from "@/lib/local-documents";
import { formatNaira } from "@/lib/money";
import { DEFAULT_PAGE_SIZE, paginateItems } from "@/lib/pagination";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const filters: Array<{ id: "all" | DocumentStatus | "invoice" | "receipt"; label: string }> =
  [
    { id: "all", label: "All" },
    { id: "overdue", label: "Overdue" },
    { id: "sent", label: "Sent" },
    { id: "part_paid", label: "Part-paid" },
    { id: "paid", label: "Paid" },
    { id: "draft", label: "Draft" },
    { id: "invoice", label: "Invoices" },
    { id: "receipt", label: "Receipts" },
  ];

export function DocumentsList({
  documents,
}: {
  documents: DashboardDocument[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [localDocs, setLocalDocs] = useState<DashboardDocument[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await apiGet<{ documents: SavedDocument[] }>(
        "/api/documents",
      );
      if (cancelled) return;
      if (remote?.documents) {
        setLocalDocs(remote.documents.map(savedToDashboard));
        return;
      }
      setLocalDocs(listSavedDocuments().map(savedToDashboard));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allDocuments = useMemo(() => {
    const ids = new Set(localDocs.map((doc) => doc.id));
    return [...localDocs, ...documents.filter((doc) => !ids.has(doc.id))];
  }, [documents, localDocs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDocuments.filter((doc) => {
      const matchesQuery =
        !q ||
        doc.customer.toLowerCase().includes(q) ||
        doc.number.toLowerCase().includes(q) ||
        doc.phone.includes(q);
      const matchesFilter =
        filter === "all" ||
        filter === doc.status ||
        filter === doc.type;
      return matchesQuery && matchesFilter;
    });
  }, [allDocuments, filter, query]);

  useEffect(() => {
    setPage(1);
  }, [query, filter]);

  const paged = useMemo(
    () => paginateItems(filtered, page, DEFAULT_PAGE_SIZE),
    [filtered, page],
  );

  return (
    <div className="motion-stagger grid gap-5">
      <header
        data-tour="documents-hero"
        className="flex flex-col gap-4 @[42rem]/main:flex-row @[42rem]/main:items-end @[42rem]/main:justify-between"
      >
        <div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight sm:text-3xl">
            Documents
          </h1>
          <p className="mt-1.5 text-sm text-muted sm:text-base">
            Invoices and receipts you have sent, drafted, or still need to chase.
          </p>
        </div>
        <Link
          href="/documents/new"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-[0_14px_28px_-16px_rgba(15,23,15,0.65)] transition-transform active:scale-[0.98] @[42rem]/main:w-auto"
        >
          <PlusIcon className="size-4" />
          New document
        </Link>
      </header>

      <div className="app-panel rounded-[1.35rem] border border-border bg-surface p-3 sm:p-4">
        <label className="flex h-11 items-center gap-2.5 rounded-full bg-[#eef2ef] px-3.5 text-sm text-muted">
          <SearchIcon className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer, invoice number, or phone"
            className="w-full bg-transparent outline-none placeholder:text-muted"
            aria-label="Search documents"
          />
        </label>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef1ee] text-muted">
            <FilterIcon className="size-4" />
          </span>
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFilter(item.id);
                  setPage(1);
                }}
                aria-pressed={active}
                className={
                  active
                    ? "shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                    : "shrink-0 rounded-full bg-[#eef1ee] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="app-panel overflow-hidden rounded-[1.35rem] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-separator px-5 py-4">
          <p className="text-sm text-muted">
            {filtered.length === 1
              ? "1 document"
              : `${filtered.length} documents`}
          </p>
        </div>

        {filtered.length === 0 ? (
          allDocuments.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                className="border-0 bg-transparent shadow-none"
                illustration={
                  <DocumentsScene className="mx-auto h-auto w-full max-w-sm" />
                }
                title="No documents yet"
                body="Create an invoice or load an industry sample pack from Settings."
                actions={
                  <Link
                    href="/documents/new"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background"
                  >
                    New document
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="font-medium">No documents match</p>
              <p className="mt-1 text-sm text-muted">
                Try another filter or create a new invoice.
              </p>
            </div>
          )
        ) : (
          <>
            <ul className="divide-y divide-separator">
              {paged.items.map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-[#fafafa] sm:px-5 @[40rem]/main:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_auto_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{doc.customer}</p>
                        <StatusChip status={doc.status} />
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted">
                        {doc.number}
                        <span className="mx-1.5 text-border">·</span>
                        {doc.issueDate}
                      </p>
                    </div>

                    <p className="hidden truncate text-sm text-muted @[40rem]/main:block">
                      {doc.type === "receipt" ? "Receipt" : "Invoice"}
                      {doc.dueDate ? ` · due ${doc.dueDate}` : ""}
                    </p>

                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatNaira(doc.totalKobo)}
                      </p>
                      {doc.balanceKobo > 0 ? (
                        <p className="mt-0.5 text-xs text-muted tabular-nums">
                          owes {formatNaira(doc.balanceKobo)}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-brand">Settled</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination
              page={paged.page}
              pageSize={paged.pageSize}
              totalPages={paged.totalPages}
              total={paged.total}
              start={paged.start}
              end={paged.end}
              hasPrev={paged.hasPrev}
              hasNext={paged.hasNext}
              onPageChange={setPage}
              noun="documents"
            />
          </>
        )}
      </section>
    </div>
  );
}
