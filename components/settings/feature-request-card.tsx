"use client";

import { SparklesIcon, WhatsAppIcon } from "@/components/app/icons";
import {
  featureRequestWhatsAppUrl,
  listFeatureRequests,
  saveFeatureRequest,
  type FeatureRequest,
} from "@/lib/feature-requests";
import { useEffect, useState, type FormEvent } from "react";

export function FeatureRequestCard() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<FeatureRequest | null>(null);
  const [recent, setRecent] = useState<FeatureRequest[]>([]);

  useEffect(() => {
    setRecent(listFeatureRequests().slice(0, 3));
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(null);
    const result = saveFeatureRequest(text);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(result.request);
    setRecent(listFeatureRequests().slice(0, 3));
    setText("");
  }

  return (
    <section
      id="feature-request"
      className="scroll-mt-6 rounded-[1.5rem] border border-border bg-[linear-gradient(160deg,#fff_0%,#f3f8f4_100%)] p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--brand)_14%,white)] text-brand">
          <SparklesIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight">
            Request a feature
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tell us what would make InvoiceNaija work better for your business.
            Ideas are saved on this device — you can also send them on WhatsApp.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">What should we build next?</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            className="field-input resize-y"
            placeholder="e.g. Multi-currency quotes, delivery notes, or team seats…"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            Save request
          </button>
          {text.trim().length >= 8 ? (
            <a
              href={featureRequestWhatsAppUrl(text)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_7%,white)] px-4 text-sm font-medium"
            >
              <WhatsAppIcon className="size-4 text-brand" />
              Send on WhatsApp
            </a>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-[color-mix(in_oklab,var(--danger)_75%,black)]">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-2xl border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-white/80 px-3 py-2.5 text-sm text-brand">
            Saved. Thanks — we use these notes to decide what ships next.
          </p>
        ) : null}
      </form>

      {recent.length > 0 ? (
        <div className="mt-5 border-t border-separator pt-4">
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
            Recent on this device
          </p>
          <ul className="mt-2 grid gap-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-border bg-white/85 px-3 py-2.5 text-sm text-muted"
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
