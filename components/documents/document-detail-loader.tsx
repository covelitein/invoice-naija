"use client";

import { DocumentDetailView } from "@/components/documents/document-detail";
import type { DocumentDetail } from "@/lib/documents";
import { getSavedDocument, savedToDetail } from "@/lib/local-documents";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DocumentDetailLoader({
  id,
  seed,
}: {
  id: string;
  seed?: DocumentDetail;
}) {
  const [document, setDocument] = useState<DocumentDetail | null>(seed ?? null);
  const [ready, setReady] = useState(Boolean(seed));

  useEffect(() => {
    if (seed) {
      setDocument(seed);
      setReady(true);
      return;
    }
    const local = getSavedDocument(id);
    setDocument(local ? savedToDetail(local) : null);
    setReady(true);
  }, [id, seed]);

  if (!ready) {
    return (
      <div className="app-panel rounded-[1.35rem] border border-border bg-surface px-5 py-10 text-sm text-muted">
        Loading document…
      </div>
    );
  }

  if (!document) {
    return (
      <div className="app-panel rounded-[1.35rem] border border-border bg-surface px-6 py-14 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Document not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          It may have been cleared from this browser.
        </p>
        <Link
          href="/documents"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Back to documents
        </Link>
      </div>
    );
  }

  return <DocumentDetailView document={document} />;
}
