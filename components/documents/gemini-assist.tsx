"use client";

import { SparklesIcon } from "@/components/app/icons";
import { GeminiSparkScene } from "@/components/illustrations/scenes";
import {
  industryAssistCopy,
  type GeminiDraftResult,
} from "@/lib/gemini-draft";
import type { Industry } from "@/lib/settings";
import { useEffect, useId, useState } from "react";

export function GeminiAssist({
  enabled = true,
  industry = "general",
  onDraft,
}: {
  enabled?: boolean;
  industry?: Industry;
  onDraft: (draft: GeminiDraftResult & { notice?: string }) => void;
}) {
  const copy = industryAssistCopy(industry);
  const [prompt, setPrompt] = useState(copy.example);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const labelId = useId();

  useEffect(() => {
    setPrompt(industryAssistCopy(industry).example);
  }, [industry]);

  if (!enabled) {
    return (
      <section className="app-panel rounded-[1.35rem] border border-dashed border-border bg-surface/70 px-5 py-4">
        <p className="text-sm font-medium">Gemini drafting is off</p>
        <p className="mt-1 text-sm text-muted">
          Turn it on in Settings to fill invoices from a short note.
        </p>
      </section>
    );
  }

  async function runDraft() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/gemini/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry }),
      });
      const data = (await response.json()) as GeminiDraftResult & {
        notice?: string;
        error?: string;
      };
      if (!response.ok || data.error || !data.items) {
        setError(data.error || "Could not draft invoice.");
        return;
      }
      if (data.notice) setNotice(data.notice);
      onDraft(data);
    } catch {
      setError("Network error while contacting Gemini.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      data-tour="gemini-assist"
      className="app-panel motion-rise relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--brand)_10%,white)_0%,#fff_55%,#f7faf7_100%)] px-5 py-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] blur-2xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-2.5 py-1 text-[11px] font-medium text-brand">
            <SparklesIcon className="size-3.5" />
            Gemini assist
          </div>
          <h2 className="mt-2 text-base font-semibold tracking-tight">
            Draft this invoice from a note
          </h2>
          <p className="mt-1 text-sm text-muted">
            Casual notes are fine — Gemini expands any trade into clear line
            items you can edit before sending.
          </p>
        </div>
        <GeminiSparkScene className="hidden h-20 w-28 shrink-0 sm:block" />
      </div>

      <label htmlFor={labelId} className="sr-only">
        Describe the invoice
      </label>
      <textarea
        id={labelId}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={3}
        className="relative mt-4 w-full resize-y rounded-2xl border border-border bg-white/90 px-3.5 py-3 text-sm outline-none transition-colors focus:border-foreground"
        placeholder={copy.placeholder}
      />

      <div className="relative mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runDraft}
          disabled={loading || !prompt.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
        >
          <SparklesIcon className="size-4" />
          {loading ? "Drafting…" : "Draft with Gemini"}
        </button>
        {notice ? <p className="text-xs text-muted">{notice}</p> : null}
        {error ? (
          <p className="text-xs text-[color-mix(in_oklab,var(--danger)_75%,black)]">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
