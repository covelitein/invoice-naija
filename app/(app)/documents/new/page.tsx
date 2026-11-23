import { NewDocumentClient } from "@/components/documents/new-document-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "New document",
};

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="app-panel rounded-[1.35rem] border border-border bg-surface px-5 py-10 text-sm text-muted">
          Loading builder…
        </div>
      }
    >
      <NewDocumentClient />
    </Suspense>
  );
}
