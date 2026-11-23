"use client";

import {
  brandingFromSettings,
  type InvoiceBranding,
} from "@/lib/invoice-branding";
import type { DocumentDetail } from "@/lib/documents";
import { buildInvoiceHtml } from "@/lib/invoice-pdf";
import { loadSettings } from "@/lib/settings";
import { useEffect, useMemo, useState } from "react";

export function InvoicePreview({
  document,
  branding: brandingProp,
  className = "",
}: {
  document: DocumentDetail;
  branding?: InvoiceBranding;
  className?: string;
}) {
  const [branding, setBranding] = useState<InvoiceBranding>(
    () => brandingProp || brandingFromSettings(loadSettings()),
  );

  useEffect(() => {
    if (brandingProp) {
      setBranding(brandingProp);
      return;
    }
    setBranding(brandingFromSettings(loadSettings()));
  }, [brandingProp]);

  const srcDoc = useMemo(
    () => buildInvoiceHtml(document, { branding }),
    [document, branding],
  );

  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border border-border bg-white shadow-[0_18px_40px_-28px_rgba(15,23,15,0.35)] ${className}`}
    >
      <iframe
        title={`${document.number} preview`}
        srcDoc={srcDoc}
        className="block w-full border-0 bg-white"
        style={{ minHeight: 920 }}
        onLoad={(event) => {
          const frame = event.currentTarget;
          const doc = frame.contentDocument;
          const sheet = doc?.querySelector(".sheet") as HTMLElement | null;
          if (!sheet) return;
          // Fit iframe height to the invoice sheet so preview isn't clipped.
          const height = Math.ceil(sheet.getBoundingClientRect().height + 24);
          frame.style.height = `${Math.max(640, height)}px`;
        }}
      />
    </div>
  );
}
