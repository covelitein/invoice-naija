"use client";

import { PdfIcon } from "@/components/app/icons";
import type { DocumentDetail } from "@/lib/documents";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { useState } from "react";

export function ExportPdfButton({
  document,
  className,
}: {
  document: DocumentDetail;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setError(null);
    setBusy(true);
    try {
      // Uses Settings branding + embedded Noto Sans for ₦ and typography.
      await downloadInvoicePdf(document);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not download PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className={
          className ||
          "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium disabled:opacity-60"
        }
      >
        <PdfIcon className="size-4" />
        {busy ? "Preparing…" : "Download PDF"}
      </button>
      {error ? (
        <p className="text-xs text-[color-mix(in_oklab,var(--danger)_75%,black)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
