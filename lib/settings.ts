import {
  readStorageJson,
  STORAGE_KEYS,
  writeStorageJson,
  type StorageWriteResult,
} from "@/lib/storage";

export type AiProvider = "off" | "gemini";

export type Industry =
  | "general"
  | "fashion"
  | "software"
  | "retail"
  | "construction"
  | "beauty"
  | "education"
  | "professional";

export type InvoiceTemplate = "classic" | "modern" | "minimal";
export type InvoiceFont = "sans" | "serif";

export const INDUSTRY_OPTIONS: { id: Industry; label: string }[] = [
  { id: "general", label: "General / other" },
  { id: "fashion", label: "Fashion & tailoring" },
  { id: "software", label: "Software & freelancers" },
  { id: "retail", label: "Retail & trading" },
  { id: "construction", label: "Construction & artisans" },
  { id: "beauty", label: "Beauty & wellness" },
  { id: "education", label: "Education & training" },
  { id: "professional", label: "Professional services" },
];

export const INVOICE_TEMPLATE_OPTIONS: {
  id: InvoiceTemplate;
  label: string;
  description: string;
}[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Clean table, accent mark, familiar SMB look.",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Bold coloured header band and strong hierarchy.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Quiet rules, lots of air, logo-forward.",
  },
];

export type AppSettings = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  defaultTaxPercent: number;
  plan: "free" | "pro";
  industry: Industry;
  aiProvider: AiProvider;
  geminiEnabled: boolean;
  geminiAutoFillNotes: boolean;
  samplePackId: string | null;
  invoiceTemplate: InvoiceTemplate;
  invoiceFont: InvoiceFont;
  accentColor: string;
  logoDataUrl: string | null;
  letterheadDataUrl: string | null;
  showLetterhead: boolean;
  invoiceFooterNote: string;
};

export const defaultSettings: AppSettings = {
  businessName: "Your business",
  ownerName: "Owner",
  email: "",
  phone: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  defaultTaxPercent: 0,
  plan: "free",
  industry: "general",
  aiProvider: "gemini",
  geminiEnabled: true,
  geminiAutoFillNotes: true,
  samplePackId: null,
  invoiceTemplate: "classic",
  invoiceFont: "sans",
  accentColor: "#1f8f4e",
  logoDataUrl: null,
  letterheadDataUrl: null,
  showLetterhead: true,
  invoiceFooterNote: "",
};

export function coerceSettingsFromUnknown(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") {
    return coerceSettings(null);
  }
  return coerceSettings(raw as Partial<AppSettings>);
}

function coerceSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  const template = INVOICE_TEMPLATE_OPTIONS.some(
    (option) => option.id === raw?.invoiceTemplate,
  )
    ? (raw!.invoiceTemplate as InvoiceTemplate)
    : defaultSettings.invoiceTemplate;

  return {
    ...defaultSettings,
    ...raw,
    industry: INDUSTRY_OPTIONS.some((option) => option.id === raw?.industry)
      ? (raw!.industry as Industry)
      : defaultSettings.industry,
    plan: raw?.plan === "pro" ? "pro" : "free",
    aiProvider: raw?.aiProvider === "off" ? "off" : "gemini",
    geminiEnabled:
      typeof raw?.geminiEnabled === "boolean"
        ? raw.geminiEnabled
        : defaultSettings.geminiEnabled,
    geminiAutoFillNotes:
      typeof raw?.geminiAutoFillNotes === "boolean"
        ? raw.geminiAutoFillNotes
        : defaultSettings.geminiAutoFillNotes,
    defaultTaxPercent: Number(raw?.defaultTaxPercent) || 0,
    samplePackId:
      typeof raw?.samplePackId === "string" ? raw.samplePackId : null,
    invoiceTemplate: template,
    invoiceFont: raw?.invoiceFont === "serif" ? "serif" : "sans",
    accentColor:
      typeof raw?.accentColor === "string" && /^#?[0-9a-fA-F]{3,8}$/.test(raw.accentColor)
        ? raw.accentColor.startsWith("#")
          ? raw.accentColor
          : `#${raw.accentColor}`
        : defaultSettings.accentColor,
    logoDataUrl:
      typeof raw?.logoDataUrl === "string" ? raw.logoDataUrl : null,
    letterheadDataUrl:
      typeof raw?.letterheadDataUrl === "string"
        ? raw.letterheadDataUrl
        : null,
    showLetterhead:
      typeof raw?.showLetterhead === "boolean"
        ? raw.showLetterhead
        : defaultSettings.showLetterhead,
    invoiceFooterNote:
      typeof raw?.invoiceFooterNote === "string"
        ? raw.invoiceFooterNote
        : "",
  };
}

export function loadSettings(): AppSettings {
  const raw = readStorageJson<Partial<AppSettings> | null>(
    STORAGE_KEYS.settings,
    null,
  );
  return coerceSettings(raw);
}

export function saveSettings(settings: AppSettings): StorageWriteResult {
  return writeStorageJson(STORAGE_KEYS.settings, coerceSettings(settings));
}

export function bankLineFromSettings(settings: AppSettings) {
  const parts = [
    settings.accountName || settings.businessName,
    settings.bankName,
    settings.accountNumber,
  ].filter(Boolean);
  return parts.join(" · ") || "Add bank details in Settings";
}

export function profileFromSettings(settings: AppSettings) {
  return {
    name: settings.businessName || "Your business",
    owner: settings.ownerName || "Owner",
    email: settings.email || "Add email in Settings",
    phone: settings.phone || "",
    plan: settings.plan,
    documentsThisMonth: 0,
    documentLimit: settings.plan === "pro" ? Infinity : 5,
  };
}
