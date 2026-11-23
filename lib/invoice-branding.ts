import {
  loadSettings,
  type AppSettings,
  type InvoiceFont,
  type InvoiceTemplate,
} from "@/lib/settings";

export type InvoiceBranding = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: "free" | "pro";
  template: InvoiceTemplate;
  accentColor: string;
  invoiceFont: InvoiceFont;
  logoDataUrl: string | null;
  letterheadDataUrl: string | null;
  showLetterhead: boolean;
  invoiceFooterNote: string;
};

export const ACCENT_PRESETS = [
  { id: "green", label: "Naija green", value: "#1f8f4e" },
  { id: "navy", label: "Navy", value: "#1e3a5f" },
  { id: "charcoal", label: "Charcoal", value: "#1f2933" },
  { id: "teal", label: "Teal", value: "#0f766e" },
  { id: "wine", label: "Wine", value: "#7f1d1d" },
] as const;

export function brandingFromSettings(
  settings: AppSettings = loadSettings(),
): InvoiceBranding {
  return {
    businessName: settings.businessName || "Your business",
    ownerName: settings.ownerName || "Owner",
    email: settings.email || "",
    phone: settings.phone || "",
    plan: settings.plan,
    template: settings.invoiceTemplate,
    accentColor: settings.accentColor || "#1f8f4e",
    invoiceFont: settings.invoiceFont,
    logoDataUrl: settings.logoDataUrl,
    letterheadDataUrl: settings.letterheadDataUrl,
    showLetterhead: settings.showLetterhead,
    invoiceFooterNote: settings.invoiceFooterNote.trim(),
  };
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return [31, 143, 78];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function fontStack(font: InvoiceFont) {
  // Named families (not CSS variables) so iframe preview + PDF HTML both work.
  if (font === "serif") {
    return '"Source Serif 4", "Iowan Old Style", Palatino, Georgia, serif';
  }
  return '"DM Sans", "Segoe UI", Geist, Helvetica, Arial, sans-serif';
}

/** Initials for the logo mark when no image is uploaded. */
export function businessInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "IN";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return `${first}${last}`.toUpperCase() || "IN";
}

/** Compress / reject oversized image uploads for localStorage. */
export async function fileToBrandingDataUrl(
  file: File,
  options: { maxEdge?: number; maxBytes?: number; quality?: number } = {},
): Promise<{ ok: true; dataUrl: string } | { ok: false; message: string }> {
  const maxEdge = options.maxEdge ?? 1400;
  const maxBytes = options.maxBytes ?? 450_000;
  const quality = options.quality ?? 0.82;

  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Choose a PNG or JPG image." };
  }
  if (file.size > 4_000_000) {
    return { ok: false, message: "Image is too large (max 4MB before compress)." };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { ok: false, message: "Could not process that image." };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > maxBytes) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.65);
  }
  if (dataUrl.length > maxBytes) {
    return {
      ok: false,
      message: "Image is still too large after compress. Try a smaller file.",
    };
  }
  return { ok: true, dataUrl };
}
