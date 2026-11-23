import { WhatsAppIcon } from "@/components/app/icons";
import { StatusChip } from "@/components/dashboard/status-chip";
import {
  type DashboardDocument,
  whatsappReminderUrl,
} from "@/lib/dashboard-data";
import { formatNaira } from "@/lib/money";

export function OverdueList({
  documents,
}: {
  documents: DashboardDocument[];
}) {
  if (documents.length === 0) return null;

  return (
    <section
      id="overdue"
      className="app-panel overflow-hidden rounded-[1.35rem] border border-border bg-surface"
    >
      <div className="border-b border-separator bg-[linear-gradient(180deg,#fbfcfb_0%,#fff_100%)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Overdue follow-ups
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Sorted by how late they are. Remind them on WhatsApp.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[color-mix(in_oklab,var(--danger)_12%,white)] px-2.5 py-1 text-[11px] font-medium text-[color-mix(in_oklab,var(--danger)_75%,black)]">
            {documents.length}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-separator">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col gap-3 px-4 py-4 @[40rem]/main:flex-row @[40rem]/main:items-center @[40rem]/main:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{doc.customer}</p>
                <StatusChip status={doc.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                <span className="font-mono text-xs">{doc.number}</span>
                <span className="mx-1.5 text-border">·</span>
                {doc.daysOverdue} {doc.daysOverdue === 1 ? "day" : "days"} late
                <span className="mx-1.5 text-border">·</span>
                {formatNaira(doc.balanceKobo)} owed
              </p>
            </div>

            <a
              href={whatsappReminderUrl(doc)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_7%,white)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--brand)_12%,white)] @[40rem]/main:w-auto"
            >
              <WhatsAppIcon className="size-4 text-brand" />
              Remind on WhatsApp
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
