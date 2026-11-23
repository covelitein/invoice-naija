"use client";

import { SparklesIcon } from "@/components/app/icons";
import { FeatureRequestCard } from "@/components/settings/feature-request-card";
import { useProductTour } from "@/components/tour/product-tour";
import { AppSelect } from "@/components/ui/app-select";
import { useToast } from "@/components/ui/hostinger-toast";
import {
  ACCENT_PRESETS,
  businessInitials,
  fileToBrandingDataUrl,
} from "@/lib/invoice-branding";
import { apiGet, apiSend } from "@/lib/api-client";
import { samplePacks } from "@/lib/sample-packs";
import {
  defaultSettings,
  INDUSTRY_OPTIONS,
  INVOICE_TEMPLATE_OPTIONS,
  loadSettings,
  saveSettings,
  type AiProvider,
  type AppSettings,
  type Industry,
  type InvoiceFont,
  type InvoiceTemplate,
} from "@/lib/settings";
import { isValidAccountNumber, isValidNgPhone } from "@/lib/validation";
import {
  applySamplePackById,
  clearWorkspaceData,
} from "@/lib/workspace";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

export function SettingsView({
  initial = defaultSettings,
}: {
  initial?: AppSettings;
}) {
  const { startTour } = useProductTour();
  const toast = useToast();
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await apiGet<{ settings: AppSettings }>("/api/settings");
      if (cancelled) return;
      if (remote?.settings) {
        setSettings(remote.settings);
        return;
      }
      setSettings(loadSettings());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setMessage(null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (settings.phone && !isValidNgPhone(settings.phone)) {
      const err = "Enter a valid Nigerian business phone (e.g. 0803…).";
      setError(err);
      toast.error("Invalid Phone Number", err);
      return;
    }
    if (settings.accountNumber && !isValidAccountNumber(settings.accountNumber)) {
      const err = "Account number should be 10 digits.";
      setError(err);
      toast.error("Invalid Account Number", err);
      return;
    }

    setSaving(true);
    const remote = await apiSend<{ settings: AppSettings }>(
      "/api/settings",
      "PUT",
      settings,
    );
    setSaving(false);

    if (remote.ok) {
      setSettings(remote.data.settings);
      saveSettings(remote.data.settings);
      setSaved(true);
      setMessage("Settings saved to database.");
      toast.success(
        "Settings saved to database",
        "Your business profile, bank details, and branding are updated.",
      );
      return;
    }

    const result = saveSettings(settings);
    if (!result.ok) {
      setError(result.message);
      toast.error("Save Error", result.message);
      return;
    }
    setSaved(true);
    setMessage("Saved on this device.");
    toast.info("Saved Locally", "Settings saved on this device.");
  }

  function loadPack(id: string) {
    setError(null);
    const result = applySamplePackById(id);
    if (!result.ok) {
      setError(result.message);
      toast.error("Sample Data Error", result.message);
      return;
    }
    setSettings(result.settings);
    setSaved(false);
    setMessage(result.message);
    toast.info("Sample Pack Loaded", result.message);
  }

  function clearData() {
    setError(null);
    const next = clearWorkspaceData();
    setSettings(next);
    setSaved(false);
    setMessage("Cleared local documents, customers, and settings.");
    toast.info("Data Reset", "Local documents, customers, and settings have been cleared.");
  }

  return (
    <div className="motion-stagger grid gap-5">
      <header data-tour="settings-hero">
        <h1 className="text-[1.65rem] font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          Business profile, industry context, plan, and Gemini drafting.
        </p>
      </header>

      <form onSubmit={save} className="grid gap-5">
        <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold">Business profile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Labeled label="Business name">
              <input
                className="field-input"
                value={settings.businessName}
                onChange={(event) =>
                  update("businessName", event.target.value)
                }
              />
            </Labeled>
            <Labeled label="Owner">
              <input
                className="field-input"
                value={settings.ownerName}
                onChange={(event) => update("ownerName", event.target.value)}
              />
            </Labeled>
            <Labeled label="Email">
              <input
                className="field-input"
                type="email"
                value={settings.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Labeled>
            <Labeled label="Phone">
              <input
                className="field-input"
                value={settings.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="0803…"
              />
            </Labeled>
            <div className="sm:col-span-2">
              <AppSelect
                label="Industry"
                value={settings.industry}
                options={INDUSTRY_OPTIONS}
                onChange={(value) => update("industry", value as Industry)}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Industry shapes Gemini drafting examples and local expansions —
            fashion, software, retail, construction, and more.
          </p>
        </section>

        <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold">Bank details</h2>
          <p className="mt-1 text-sm text-muted">
            Shown on invoices so customers know where to pay.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Labeled label="Bank">
              <input
                className="field-input"
                value={settings.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Labeled>
            <Labeled label="Account name">
              <input
                className="field-input"
                value={settings.accountName}
                onChange={(event) => update("accountName", event.target.value)}
              />
            </Labeled>
            <Labeled label="Account number">
              <input
                className="field-input"
                value={settings.accountNumber}
                onChange={(event) =>
                  update("accountNumber", event.target.value)
                }
              />
            </Labeled>
          </div>
          <Labeled label="Default tax %" className="mt-3 max-w-xs">
            <input
              className="field-input"
              type="number"
              min={0}
              step="0.1"
              value={settings.defaultTaxPercent}
              onChange={(event) =>
                update("defaultTaxPercent", Number(event.target.value) || 0)
              }
            />
          </Labeled>
        </section>

        <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
          <h2 className="text-base font-semibold">Invoice look</h2>
          <p className="mt-1 text-sm text-muted">
            Templates, colours, fonts, logo, and letterhead for preview and PDF
            downloads.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {INVOICE_TEMPLATE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={settings.invoiceTemplate === option.id}
                onClick={() =>
                  update("invoiceTemplate", option.id as InvoiceTemplate)
                }
                className={
                  settings.invoiceTemplate === option.id
                    ? "rounded-2xl border border-foreground bg-white px-4 py-3 text-left"
                    : "rounded-2xl border border-border bg-[#fbfcfb] px-4 py-3 text-left"
                }
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-xs text-muted">{option.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AppSelect
              label="Invoice font"
              value={settings.invoiceFont}
              options={[
                { id: "sans", label: "DM Sans · modern" },
                { id: "serif", label: "Source Serif · formal" },
              ]}
              onChange={(value) =>
                update("invoiceFont", value as InvoiceFont)
              }
            />
            <Labeled label="Accent colour">
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    onClick={() => update("accentColor", preset.value)}
                    className={
                      settings.accentColor.toLowerCase() ===
                      preset.value.toLowerCase()
                        ? "size-9 rounded-full ring-2 ring-foreground ring-offset-2"
                        : "size-9 rounded-full border border-border"
                    }
                    style={{ background: preset.value }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(event) =>
                    update("accentColor", event.target.value)
                  }
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-white p-1"
                  aria-label="Custom accent colour"
                />
              </div>
            </Labeled>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[#fbfcfb] p-4">
              <p className="text-sm font-medium">Logo</p>
              <p className="mt-1 text-xs text-muted">
                Upload a mark for invoices. Without one, we use your business
                initials.
              </p>
              <div className="mt-3 flex items-center gap-3">
                {settings.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoDataUrl}
                    alt=""
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="inline-flex size-16 items-center justify-center rounded-full text-sm font-bold tracking-wide text-white"
                    style={{
                      background: settings.accentColor || "#1f8f4e",
                    }}
                    aria-hidden="true"
                  >
                    {businessInitials(
                      settings.businessName || settings.ownerName || "IN",
                    )}
                  </span>
                )}
                <p className="text-xs text-muted">
                  Shown beside your business name on every invoice and PDF.
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium">
                  {settings.logoDataUrl ? "Replace logo" : "Upload logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      const result = await fileToBrandingDataUrl(file, {
                        maxEdge: 512,
                        maxBytes: 220_000,
                      });
                      if (!result.ok) {
                        setError(result.message);
                        return;
                      }
                      update("logoDataUrl", result.dataUrl);
                    }}
                  />
                </label>
                {settings.logoDataUrl ? (
                  <button
                    type="button"
                    onClick={() => update("logoDataUrl", null)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium"
                  >
                    Use initials
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-[#fbfcfb] p-4">
              <p className="text-sm font-medium">Letterhead</p>
              <p className="mt-1 text-xs text-muted">
                Optional wide banner across the top of every invoice.
              </p>
              {settings.letterheadDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.letterheadDataUrl}
                  alt=""
                  className="mt-3 h-16 w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium">
                  Upload letterhead
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      const result = await fileToBrandingDataUrl(file, {
                        maxEdge: 1600,
                        maxBytes: 420_000,
                      });
                      if (!result.ok) {
                        setError(result.message);
                        return;
                      }
                      update("letterheadDataUrl", result.dataUrl);
                      update("showLetterhead", true);
                    }}
                  />
                </label>
                {settings.letterheadDataUrl ? (
                  <button
                    type="button"
                    onClick={() => update("letterheadDataUrl", null)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showLetterhead}
                  onChange={(event) =>
                    update("showLetterhead", event.target.checked)
                  }
                />
                Show letterhead on invoices
              </label>
            </div>
          </div>

          <Labeled label="Custom footer note" className="mt-4">
            <input
              className="field-input"
              value={settings.invoiceFooterNote}
              placeholder="e.g. Payment due within 7 days · Thank you"
              onChange={(event) =>
                update("invoiceFooterNote", event.target.value)
              }
            />
          </Labeled>
        </section>

        <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Sample data</h2>
              <p className="mt-1 text-sm text-muted">
                Start empty, or load a trade pack to explore the product.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {samplePacks.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => loadPack(pack.id)}
                className={
                  settings.samplePackId === pack.id
                    ? "rounded-2xl border border-foreground bg-white px-4 py-3 text-left"
                    : "rounded-2xl border border-border bg-[#fbfcfb] px-4 py-3 text-left"
                }
              >
                <p className="text-sm font-semibold">{pack.label}</p>
                <p className="mt-1 text-xs text-muted">{pack.description}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearData}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium"
            >
              Clear local data
            </button>
            <button
              type="button"
              onClick={startTour}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_8%,white)] px-4 text-sm font-medium text-brand"
            >
              Replay product tour
            </button>
          </div>
        </section>

        <section className="app-panel rounded-[1.35rem] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Plan</h2>
              <p className="mt-1 text-sm text-muted">
                Free includes 5 documents each month and a small footer.
                Limits are preview-only until Paystack.
              </p>
            </div>
            <span className="rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-3 py-1.5 text-xs font-medium text-brand">
              {settings.plan === "pro" ? "Pro" : "Free"} · Preview · not
              enforced
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PlanCard
              active={settings.plan === "free"}
              title="Free"
              body="5 documents / month, InvoiceNaija footer on PDFs."
              onClick={() => update("plan", "free")}
            />
            <PlanCard
              active={settings.plan === "pro"}
              title="Pro · ₦1,500/mo"
              body="Unlimited documents, logo, no footer. Paystack later."
              onClick={() => update("plan", "pro")}
            />
          </div>
        </section>

        <section className="app-panel relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_oklab,var(--brand)_20%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--brand)_9%,white),#fff_58%)] p-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-2.5 py-1 text-[11px] font-medium text-brand">
            <SparklesIcon className="size-3.5" />
            Gemini AI
          </div>
          <h2 className="mt-2 text-base font-semibold">
            Automate invoice drafting
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Paste a short note — Gemini expands it into line items for your
            industry before you send on WhatsApp.
          </p>

          <div className="mt-5 grid gap-3">
            <Toggle
              label="Enable Gemini assist"
              description="Shows the draft panel on the create document screen."
              checked={settings.geminiEnabled}
              onChange={(checked) => {
                update("geminiEnabled", checked);
                update("aiProvider", checked ? "gemini" : "off");
              }}
            />
            <Toggle
              label="Prefer AI notes on the invoice"
              description="When on, Gemini notes replace empty notes; your typed notes still win if already filled."
              checked={settings.geminiAutoFillNotes}
              onChange={(checked) => update("geminiAutoFillNotes", checked)}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(["gemini", "off"] as AiProvider[]).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => {
                  update("aiProvider", provider);
                  update("geminiEnabled", provider === "gemini");
                }}
                className={
                  settings.aiProvider === provider
                    ? "rounded-2xl border border-[color-mix(in_oklab,var(--brand)_28%,var(--border))] bg-white px-4 py-3 text-left ring-1 ring-[color-mix(in_oklab,var(--brand)_18%,transparent)]"
                    : "rounded-2xl border border-border bg-white/70 px-4 py-3 text-left"
                }
              >
                <p className="text-sm font-medium">
                  {provider === "gemini" ? "Gemini" : "Manual only"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {provider === "gemini"
                    ? "Preferred AI option for InvoiceNaija drafting."
                    : "Fill every field yourself."}
                </p>
              </button>
            ))}
          </div>

          <p className="mt-4 rounded-2xl bg-white/80 px-3 py-3 text-xs text-muted">
            Live Gemini needs <code className="font-mono">GEMINI_API_KEY</code>{" "}
            in your environment. Without it, the assist still drafts locally so
            you can try the flow.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? (
              <>
                <svg
                  className="size-4 animate-spin text-background"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saving to database…</span>
              </>
            ) : (
              <span>Save settings</span>
            )}
          </button>
          {error ? (
            <p className="text-sm font-medium text-[color-mix(in_oklab,var(--danger)_75%,black)]">
              {error}
            </p>
          ) : null}
          {!error && (saved || message) ? (
            <p className="text-sm font-medium text-brand">
              {message || "Settings saved to database."}
            </p>
          ) : null}
        </div>
      </form>

      <FeatureRequestCard />
    </div>
  );
}

function Labeled({
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

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-white/85 px-4 py-3 text-left"
      aria-checked={checked}
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
      <span
        className={
          checked
            ? "relative h-7 w-12 rounded-full bg-brand"
            : "relative h-7 w-12 rounded-full bg-[#d9ddd9]"
        }
      >
        <span
          className={
            checked
              ? "absolute top-0.5 left-5 size-6 rounded-full bg-white shadow transition-all"
              : "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-all"
          }
        />
      </span>
    </button>
  );
}

function PlanCard({
  active,
  title,
  body,
  onClick,
}: {
  active: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-2xl border border-foreground bg-white px-4 py-4 text-left"
          : "rounded-2xl border border-border bg-[#fbfcfb] px-4 py-4 text-left"
      }
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted">{body}</p>
    </button>
  );
}
