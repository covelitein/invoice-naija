"use client";

import {
  ChevronLeftIcon,
  PlusIcon,
  WhatsAppIcon,
} from "@/components/app/icons";
import { ExportPdfButton } from "@/components/documents/export-pdf-button";
import { InvoicePreview } from "@/components/documents/invoice-preview";
import { StatusChip } from "@/components/dashboard/status-chip";
import type { DocumentDetail } from "@/lib/documents";
import { whatsappReminderUrl } from "@/lib/documents";
import { formatNaira } from "@/lib/money";
import Link from "next/link";

export function DocumentDetailView({
  document,
}: {
  document: DocumentDetail;
}) {
  return (
    <div className="motion-stagger grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Documents
        </Link>
        <Link
          href="/documents/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background"
        >
          <PlusIcon className="size-3.5" />
          New
        </Link>
      </div>

      <header className="app-panel rounded-[1.5rem] border border-border bg-[linear-gradient(145deg,#fff_0%,#f4f8f4_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={document.status} />
          <span className="rounded-full bg-[#eef1ee] px-2.5 py-1 text-[11px] font-medium text-muted">
            {document.type === "receipt" ? "Receipt" : "Invoice"}
          </span>
        </div>
        <h1 className="mt-3 text-[1.65rem] font-semibold tracking-tight sm:text-3xl">
          {document.customer}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted">
          {document.number}
          <span className="mx-1.5 text-border">·</span>
          Issued {document.issueDate}
          {document.dueDate ? (
            <>
              <span className="mx-1.5 text-border">·</span>
              Due {document.dueDate}
            </>
          ) : null}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric label="Total" value={formatNaira(document.totalKobo)} />
          <Metric
            label="Amount due"
            value={formatNaira(document.totalKobo)}
            emphasize={document.totalKobo > 0}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ExportPdfButton document={document} />
          {document.totalKobo > 0 ? (
            <a
              href={whatsappReminderUrl(document)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_7%,white)] px-4 text-sm font-medium"
            >
              <WhatsAppIcon className="size-4 text-brand" />
              Remind on WhatsApp
            </a>
          ) : null}
          <Link
            href="/settings"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium"
          >
            Customise look
          </Link>
        </div>
      </header>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Invoice preview
            </h2>
            <p className="mt-1 text-sm text-muted">
              Live look with your letterhead, logo, colours, and fonts from
              Settings.
            </p>
          </div>
        </div>
        <InvoicePreview document={document} />
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/80 px-4 py-3">
      <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
        {label}
      </p>
      <p
        className={
          emphasize
            ? "mt-1 text-lg font-semibold text-[color-mix(in_oklab,var(--danger)_75%,black)] tabular-nums"
            : "mt-1 text-lg font-semibold tabular-nums"
        }
      >
        {value}
      </p>
    </div>
  );
}
