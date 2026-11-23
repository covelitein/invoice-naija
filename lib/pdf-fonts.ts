import type { jsPDF } from "jspdf";

const fontCache: { regular?: string; bold?: string } = {};

async function fetchFontAsBinaryString(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load font: ${url}`);
  }
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return binary;
}

/** Embed Noto Sans so ₦ and UI copy render cleanly in downloads. */
export async function ensureInvoiceFonts(pdf: jsPDF) {
  if (!fontCache.regular) {
    fontCache.regular = await fetchFontAsBinaryString(
      "/fonts/NotoSans-Regular.ttf",
    );
  }
  if (!fontCache.bold) {
    fontCache.bold = await fetchFontAsBinaryString("/fonts/NotoSans-Bold.ttf");
  }

  pdf.addFileToVFS("NotoSans-Regular.ttf", fontCache.regular);
  pdf.addFont("NotoSans-Regular.ttf", "InvoiceSans", "normal");
  pdf.addFileToVFS("NotoSans-Bold.ttf", fontCache.bold);
  pdf.addFont("NotoSans-Bold.ttf", "InvoiceSans", "bold");
  pdf.setFont("InvoiceSans", "normal");
}

export function setInvoiceFont(
  pdf: jsPDF,
  style: "normal" | "bold" = "normal",
) {
  pdf.setFont("InvoiceSans", style);
}
