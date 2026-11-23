import { StatusChip } from "@/components/dashboard/status-chip";
import type { DashboardDocument } from "@/lib/dashboard-data";
import { formatNaira } from "@/lib/money";
import Link from "next/link";

export function RecentDocuments({
  documents,
}: {
  documents: DashboardDocument[];
}) {
  return (
    <section className="app-panel overflow-hidden rounded-[1.35rem] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-separator bg-[linear-gradient(180deg,#fbfcfb_0%,#fff_100%)] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Recent documents
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Your latest invoices and receipts
          </p>
        </div>
        <Link
          href="/documents"
          className="rounded-full bg-[#eef1ee] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[#e5ebe5]"
        >
          View all
        </Link>
      </div>

      <ul className="divide-y divide-separator">
        {documents.slice(0, 10).map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/documents/${doc.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-[#fafafa] sm:px-5 @[40rem]/main:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] @[40rem]/main:gap-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{doc.customer}</p>
                  <span className="hidden @[40rem]/main:inline">
                    <StatusChip status={doc.status} />
                  </span>
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

              <span className="@[40rem]/main:hidden">
                <StatusChip status={doc.status} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
