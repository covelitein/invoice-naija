"use client";

import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/app/icons";
import { GeminiAssist } from "@/components/documents/gemini-assist";
import type { Customer } from "@/lib/customers";
import { findCustomerByName } from "@/lib/customers";
import {
  draftToFormValues,
  type GeminiDraftResult,
} from "@/lib/gemini-draft";
import { apiSend } from "@/lib/api-client";
import { computeTotals, type LineItem } from "@/lib/documents";
import {
  saveLocalDocument,
  type SavedDocument,
} from "@/lib/local-documents";
import { formatNaira, toKobo } from "@/lib/money";
import type { Industry } from "@/lib/settings";
import { loadSettings } from "@/lib/settings";
import {
  isValidNgPhone,
  normalizeNgPhone,
  sanitizeOptionalPhone,
} from "@/lib/validation";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type BuilderState = {
  type: "invoice" | "receipt";
  customerName: string;
  phone: string;
  notes: string;
  discountKobo: number;
  taxPercent: number;
  items: LineItem[];
};

function createItem(id: string): LineItem {
  return {
    id,
    description: "",
    quantity: 1,
    unitKobo: 0,
  };
}

export function DocumentBuilder({
  customers,
  geminiEnabled = true,
  defaultTaxPercent = 0,
  bankLine,
  industry = "general",
}: {
  customers: Customer[];
  geminiEnabled?: boolean;
  defaultTaxPercent?: number;
  bankLine: string;
  industry?: Industry;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerQuery = searchParams.get("customer") || "";
  const [customerList, setCustomerList] = useState(customers);
  const [aiEnabled, setAiEnabled] = useState(geminiEnabled);
  const [autoFillNotes, setAutoFillNotes] = useState(true);
  const [activeIndustry, setActiveIndustry] = useState<Industry>(industry);
  const [activeBankLine, setActiveBankLine] = useState(bankLine);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draft" | "ready" | "whatsapp" | null>(null);
  const [lineSeq, setLineSeq] = useState(1);
  const [docId, setDocId] = useState<string | undefined>();
  const [state, setState] = useState<BuilderState>(() => {
    const match = findCustomerByName(customers, customerQuery);
    return {
      type: "invoice",
      customerName: match?.name || customerQuery || "",
      phone: match?.phone || "",
      notes: "",
      discountKobo: 0,
      taxPercent: defaultTaxPercent,
      items: [createItem("line-1")],
    };
  });

  useEffect(() => {
    setCustomerList(customers);
  }, [customers]);

  useEffect(() => {
    const settings = loadSettings();
    setAiEnabled(settings.geminiEnabled);
    setAutoFillNotes(settings.geminiAutoFillNotes);
    setActiveIndustry(settings.industry);
    const line = [
      settings.accountName || settings.businessName,
      settings.bankName,
      settings.accountNumber,
    ]
      .filter(Boolean)
      .join(" · ");
    if (line) setActiveBankLine(line);
    setState((prev) => ({
      ...prev,
      taxPercent: prev.taxPercent || settings.defaultTaxPercent,
    }));
  }, []);

  useEffect(() => {
    const match = findCustomerByName(customerList, customerQuery);
    if (!match) return;
    setState((prev) => ({
      ...prev,
      customerName: prev.customerName.trim() || match.name,
      phone: prev.phone.trim() || match.phone,
    }));
  }, [customerList, customerQuery]);

  function nextItem() {
    const next = lineSeq + 1;
    setLineSeq(next);
    return createItem(`line-${next}`);
  }

  const totals = useMemo(
    () =>
      computeTotals({
        items: state.items,
        discountKobo: state.discountKobo,
        taxPercent: state.taxPercent,
      }),
    [state],
  );

  function applyCustomer(name: string) {
    const match = findCustomerByName(customerList, name);
    setState((prev) => ({
      ...prev,
      customerName: name,
      phone: match?.phone || prev.phone,
    }));
  }

  function applyDraft(draft: GeminiDraftResult & { notice?: string }) {
    const values = draftToFormValues(draft);
    const draftPhone = sanitizeOptionalPhone(values.phone);
    setState((prev) => ({
      ...prev,
      ...values,
      // Keep identity when opening from a customer or after manual pick.
      customerName: prev.customerName.trim() || values.customerName,
      phone: draftPhone || prev.phone,
      notes: autoFillNotes
        ? values.notes || prev.notes
        : prev.notes || values.notes,
      items: values.items.length > 0 ? values.items : [nextItem()],
    }));
    setStatus(null);
    setError(null);
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function validate() {
    if (!state.customerName.trim()) return "Add a customer name.";
    if (!state.phone.trim()) return "Add a WhatsApp number.";
    if (!isValidNgPhone(state.phone)) {
      return "Enter a valid Nigerian WhatsApp number (e.g. 0803…).";
    }
    if (
      state.items.length === 0 ||
      state.items.every((item) => !item.description.trim())
    ) {
      return "Add at least one line item.";
    }
    if (totals.totalKobo <= 0) return "Total must be greater than ₦0.";
    return null;
  }

  async function persist(kind: "draft" | "sent") {
    const payload = {
      id: docId,
      type: state.type,
      customer: state.customerName.trim(),
      phone: state.phone.trim(),
      notes: state.notes.trim(),
      bankDetails: activeBankLine,
      discountKobo: state.discountKobo,
      taxPercent: state.taxPercent,
      depositKobo: 0,
      items: state.items.filter((item) => item.description.trim()),
      totalKobo: totals.totalKobo,
      balanceKobo: totals.totalKobo,
      status: kind,
    };

    const remote = await apiSend<{ document: SavedDocument }>(
      "/api/documents",
      "POST",
      payload,
    );
    if (remote.ok) {
      setDocId(remote.data.document.id);
      return { saved: remote.data.document, source: "cloud" as const };
    }

    const { saved, result } = saveLocalDocument(payload);
    if (!result.ok) {
      throw new Error(result.message);
    }
    setDocId(saved.id);
    return { saved, source: "local" as const };
  }

  async function handleSaveDraft() {
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy("draft");
    try {
      const { saved, source } = await persist("draft");
      setStatus(
        source === "cloud"
          ? `Draft ${saved.number} saved to your account.`
          : `Draft ${saved.number} saved on this device.`,
      );
      window.setTimeout(() => {
        router.push(`/documents/${saved.id}`);
      }, 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
      setBusy(null);
    }
  }

  async function handlePrepareSend() {
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy("ready");
    try {
      const { saved } = await persist("sent");
      setStatus(`${saved.number} saved. Download the PDF, then send WhatsApp.`);
      window.setTimeout(() => {
        router.push(`/documents/${saved.id}`);
      }, 450);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save document.",
      );
      setBusy(null);
    }
  }

  async function handleWhatsApp() {
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const phone = normalizeNgPhone(state.phone);
    if (!isValidNgPhone(state.phone)) {
      setError("Enter a valid WhatsApp number.");
      return;
    }

    setBusy("whatsapp");
    try {
      const { saved } = await persist("sent");
      const message = `Hello ${saved.customer.split(" ")[0] || "there"}, here is your ${saved.type} ${saved.number}. Amount due: ${formatNaira(saved.totalKobo)}. Bank: ${activeBankLine}. I'll also send the PDF.`;
      const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      setStatus(`${saved.number} saved. Opening WhatsApp with a text message…`);
      const popup = window.open(href, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.assign(href);
        return;
      }
      window.setTimeout(() => {
        router.push(`/documents/${saved.id}`);
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open WhatsApp.",
      );
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Documents
        </Link>
        {status ? (
          <p className="rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-3 py-1.5 text-xs font-medium text-brand">
            {status}
          </p>
        ) : null}
      </div>

      <header>
        <h1 className="text-[1.65rem] font-semibold tracking-tight sm:text-3xl">
          New document
        </h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          Build manually, or let Gemini draft from a short note.
        </p>
      </header>

      <GeminiAssist
        enabled={aiEnabled}
        industry={activeIndustry}
        onDraft={applyDraft}
      />

      <div className="grid gap-5 @[64rem]/main:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <div className="grid gap-5">
          <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
            <div className="flex gap-2">
              {(["invoice", "receipt"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, type }))}
                  className={
                    state.type === type
                      ? "rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
                      : "rounded-full bg-[#eef1ee] px-4 py-2 text-sm font-medium text-muted"
                  }
                >
                  {type === "invoice" ? "Invoice" : "Receipt"}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Customer">
                <input
                  list="customer-options"
                  value={state.customerName}
                  onChange={(event) => applyCustomer(event.target.value)}
                  placeholder="Select or type a name"
                  className="field-input"
                />
                <datalist id="customer-options">
                  {customerList.map((customer) => (
                    <option key={customer.id} value={customer.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="WhatsApp number">
                <input
                  value={state.phone}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="0803…"
                  className="field-input"
                />
              </Field>
            </div>
          </section>

          <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Line items</h2>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    items: [...prev.items, nextItem()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-[#eef1ee] px-3 py-1.5 text-xs font-medium"
              >
                <PlusIcon className="size-3.5" />
                Add item
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-border bg-[#fbfcfb] p-3 sm:grid-cols-[minmax(0,1.4fr)_5rem_8rem_auto]"
                >
                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateItem(item.id, {
                        description: event.target.value,
                      })
                    }
                    placeholder="What did you sell?"
                    className="field-input"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, {
                        quantity: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                    className="field-input"
                    aria-label="Quantity"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitKobo ? item.unitKobo / 100 : ""}
                    onChange={(event) =>
                      updateItem(item.id, {
                        unitKobo: toKobo(Number(event.target.value) || 0),
                      })
                    }
                    placeholder="₦0.00"
                    className="field-input"
                    aria-label="Unit price in naira"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        items:
                          prev.items.length === 1
                            ? [nextItem()]
                            : prev.items.filter((row) => row.id !== item.id),
                      }))
                    }
                    className="inline-flex size-10 items-center justify-center justify-self-end rounded-full text-muted hover:bg-white hover:text-foreground"
                    aria-label="Remove item"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Discount (₦)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={state.discountKobo ? state.discountKobo / 100 : ""}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      discountKobo: toKobo(Number(event.target.value) || 0),
                    }))
                  }
                  className="field-input"
                />
              </Field>
              <Field label="Tax %">
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={state.taxPercent || ""}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      taxPercent: Number(event.target.value) || 0,
                    }))
                  }
                  className="field-input"
                />
              </Field>
            </div>

            <Field label="Notes" className="mt-4">
              <textarea
                value={state.notes}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={3}
                className="field-input resize-y"
                placeholder="Optional note for the customer"
              />
            </Field>
          </section>

          <div className="sticky bottom-3 z-10 grid gap-3 rounded-[1.35rem] border border-border bg-[color-mix(in_oklab,white_92%,transparent)] p-3 shadow-[0_12px_40px_-24px_rgba(15,23,15,0.55)] backdrop-blur-md">
            {(error || status) && (
              <p
                className={
                  error
                    ? "rounded-2xl border border-[color-mix(in_oklab,var(--danger)_25%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_8%,white)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--danger)_75%,black)]"
                    : "rounded-2xl border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_8%,white)] px-4 py-3 text-sm text-brand"
                }
              >
                {error || status}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={busy !== null}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-medium disabled:opacity-60"
              >
                {busy === "draft" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={handlePrepareSend}
                disabled={busy !== null}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
              >
                {busy === "ready" ? "Saving…" : "Save & prepare send"}
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={busy !== null}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_7%,white)] px-5 text-sm font-medium disabled:opacity-60"
              >
                <WhatsAppIcon className="size-4 text-brand" />
                {busy === "whatsapp" ? "Opening…" : "Send WhatsApp"}
              </button>
            </div>
            <p className="text-center text-[11px] text-muted">
              WhatsApp sends a text message. Download the PDF separately to
              attach.
            </p>
          </div>
        </div>

        <aside className="app-panel h-fit rounded-[1.35rem] border border-border bg-white p-5 @[64rem]/main:sticky @[64rem]/main:top-6">
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
            Preview
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            {state.type === "receipt" ? "Receipt" : "Invoice"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {state.customerName || "Customer name"}
          </p>

          <ul className="mt-5 divide-y divide-separator border-y border-separator">
            {state.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span className="min-w-0 truncate text-muted">
                  {item.description || "Item"}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatNaira(item.quantity * item.unitKobo)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-2 text-sm">
            <PreviewRow
              label="Subtotal"
              value={formatNaira(totals.subtotalKobo)}
            />
            <PreviewRow label="Tax" value={formatNaira(totals.taxKobo)} />
            <PreviewRow
              label="Amount due"
              value={formatNaira(totals.totalKobo)}
              bold
            />
          </div>

          <p className="mt-5 rounded-2xl bg-[#eef2ef] px-3 py-3 text-xs text-muted">
            {activeBankLine}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 text-sm ${className}`}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function PreviewRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className={bold ? "font-medium" : "text-muted"}>{label}</span>
      <span className={bold ? "font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  );
}
