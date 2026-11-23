import {
  brandingFromSettings,
  businessInitials,
  fontStack,
  type InvoiceBranding,
} from "@/lib/invoice-branding";
import type { DocumentDetail } from "@/lib/documents";
import { formatNaira } from "@/lib/money";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resolveBranding(branding?: InvoiceBranding): InvoiceBranding {
  return branding || brandingFromSettings();
}

/** Mix accent into white/hex without CSS color-mix (html2canvas-safe). */
function mixHex(hex: string, withHex: string, amount: number) {
  const parse = (value: string) => {
    const raw = value.replace("#", "");
    const full =
      raw.length === 3
        ? raw
            .split("")
            .map((c) => c + c)
            .join("")
        : raw;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ] as const;
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(withHex);
  const t = Math.min(1, Math.max(0, amount));
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(Math.round(r1 + (r2 - r1) * t))}${to(Math.round(g1 + (g2 - g1) * t))}${to(Math.round(b1 + (b2 - b1) * t))}`;
}

/**
 * Chrome often returns computed colors as color(srgb …), which html2canvas
 * cannot parse. Convert any CSS color to rgb()/rgba() via canvas pixels.
 */
function cssColorToRgb(color: string): string {
  const value = color.trim();
  if (
    !value ||
    value === "transparent" ||
    value === "none" ||
    value === "rgba(0, 0, 0, 0)"
  ) {
    return "rgba(0, 0, 0, 0)";
  }
  if (/^rgba?\(/i.test(value) || /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
    return value;
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#000000";

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000000";
  try {
    ctx.fillStyle = value;
  } catch {
    return "#000000";
  }
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a === 0) return "rgba(0, 0, 0, 0)";
  if (a === 255) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`;
}

const COLOR_STYLE_PROPS = [
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "column-rule-color",
  "caret-color",
] as const;

function needsColorSanitization(value: string) {
  return /color\(|oklch\(|oklab\(|lab\(|lch\(|color-mix\(/i.test(value);
}

/** Rewrite modern CSS colors on a cloned tree so html2canvas can parse them. */
function sanitizeCloneColors(originalRoot: HTMLElement, clonedRoot: HTMLElement) {
  const originalNodes = [originalRoot, ...Array.from(originalRoot.querySelectorAll("*"))];
  const clonedNodes = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll("*"))];
  const count = Math.min(originalNodes.length, clonedNodes.length);

  for (let i = 0; i < count; i += 1) {
    const original = originalNodes[i];
    const cloned = clonedNodes[i];
    if (!(original instanceof HTMLElement) || !(cloned instanceof HTMLElement)) continue;

    const cs = original.ownerDocument.defaultView?.getComputedStyle(original);
    if (!cs) continue;

    for (const prop of COLOR_STYLE_PROPS) {
      const raw = cs.getPropertyValue(prop);
      if (!raw || raw === "initial") continue;
      if (needsColorSanitization(raw) || !/^rgba?\(/i.test(raw)) {
        try {
          cloned.style.setProperty(prop, cssColorToRgb(raw), "important");
        } catch {
          // Ignore individual property failures; capture can still succeed.
        }
      }
    }
  }
}

export function buildInvoiceHtml(
  document: DocumentDetail,
  options: {
    autoPrint?: boolean;
    branding?: InvoiceBranding;
  } = {},
) {
  const brand = resolveBranding(options.branding);
  const accent = brand.accentColor || "#1f8f4e";
  const accentSoft = mixHex(accent, "#ffffff", 0.88);
  const accentBorder = mixHex(accent, "#e7ece7", 0.82);
  const subtotal = document.items.reduce(
    (sum, item) => sum + item.quantity * item.unitKobo,
    0,
  );
  const rows = document.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${escapeHtml(formatNaira(item.unitKobo))}</td>
        <td class="num">${escapeHtml(formatNaira(item.quantity * item.unitKobo))}</td>
      </tr>`,
    )
    .join("");

  const letterhead =
    brand.showLetterhead && brand.letterheadDataUrl
      ? `<div class="letterhead"><img src="${brand.letterheadDataUrl}" alt="" /></div>`
      : "";

  const initials = escapeHtml(businessInitials(brand.businessName));
  const logo = brand.logoDataUrl
    ? `<img class="logo" src="${brand.logoDataUrl}" alt="" />`
    : `<div class="mark" style="background:${accent}" aria-hidden="true">${initials}</div>`;

  const templateClass = `template-${brand.template}`;
  const footerNote =
    brand.invoiceFooterNote ||
    (brand.plan === "pro"
      ? "Made with InvoiceNaija"
      : "Made with InvoiceNaija · Free plan");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(document.number)} · ${escapeHtml(document.customer)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: light; --accent: ${accent}; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${fontStack(brand.invoiceFont)};
      color: #111111;
      background: #ffffff;
    }
    .sheet {
      width: min(800px, 100%);
      margin: 0 auto;
      padding: 36px 36px 48px;
      background: #ffffff;
      color: #111111;
    }
    .letterhead { margin: -8px 0 20px; }
    .letterhead img {
      display: block;
      width: 100%;
      max-height: 120px;
      object-fit: cover;
      border-radius: 12px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      border-bottom: 2px solid ${accentBorder};
      padding-bottom: 20px;
    }
    .brand { display: flex; gap: 12px; align-items: center; }
    .logo, .mark {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .mark {
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1;
    }
    h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: -0.02em;
      font-weight: 700;
      color: ${accent};
    }
    .template-modern h1 { color: #ffffff; }
    .template-minimal h1 { color: #111111; }
    .meta { color: #667066; font-size: 13px; margin-top: 4px; }
    .badge {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: ${accentSoft};
      color: ${accent};
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    .label {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7a847a;
      margin-bottom: 6px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 28px;
    }
    th, td {
      padding: 12px 10px;
      border-bottom: 1px solid #ecefec;
      text-align: left;
      font-size: 14px;
      vertical-align: top;
    }
    th {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7a847a;
      background: #f7f9f7;
    }
    .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .totals { width: min(320px, 100%); margin-left: auto; margin-top: 18px; }
    .totals .row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals .row.strong {
      border-top: 1px solid #dfe6df;
      margin-top: 6px;
      padding-top: 12px;
      font-weight: 700;
      font-size: 16px;
    }
    .notes {
      margin-top: 28px;
      padding: 14px 16px;
      background: #f3f6f3;
      border-radius: 14px;
      font-size: 13px;
      color: #445044;
    }
    .footer {
      margin-top: 28px;
      font-size: 11px;
      color: #8a938a;
      text-align: center;
    }
    .template-modern .band {
      margin: -36px -36px 24px;
      padding: 28px 36px;
      background: var(--accent);
      color: #fff;
    }
    .template-modern .band .meta,
    .template-modern .band .badge { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.14); }
    .template-modern .top { border-bottom: 0; padding-bottom: 0; color: inherit; }
    .template-modern .mark {
      background: #ffffff !important;
      color: ${accent} !important;
    }
    .template-minimal .top { border-bottom-width: 1px; }
    .template-minimal th { background: transparent; }
    .template-minimal .notes { background: transparent; border: 1px solid #ecefec; }
    @media print {
      .sheet { padding: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet ${templateClass}">
    ${letterhead}
    ${
      brand.template === "modern"
        ? `<div class="band"><div class="top">`
        : `<div class="top">`
    }
      <div class="brand">
        ${logo}
        <div>
          <h1>${escapeHtml(brand.businessName)}</h1>
          <div class="meta">${escapeHtml([brand.email, brand.phone].filter(Boolean).join(" · ") || "Update profile in Settings")}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="badge">${document.type === "receipt" ? "Receipt" : "Invoice"}</div>
        <div class="meta" style="margin-top:10px">${escapeHtml(document.number)}</div>
        <div class="meta">Issued ${escapeHtml(document.issueDate)}</div>
        ${document.dueDate ? `<div class="meta">Due ${escapeHtml(document.dueDate)}</div>` : ""}
      </div>
    ${brand.template === "modern" ? `</div></div>` : `</div>`}

    <div class="grid">
      <div>
        <div class="label">Bill to</div>
        <div style="font-weight:600">${escapeHtml(document.customer)}</div>
        <div class="meta">${escapeHtml(document.phone)}</div>
      </div>
      <div>
        <div class="label">Amount due</div>
        <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;color:${accent}">${escapeHtml(formatNaira(document.totalKobo))}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${escapeHtml(formatNaira(subtotal))}</span></div>
      ${
        document.discountKobo > 0
          ? `<div class="row"><span>Discount</span><span>−${escapeHtml(formatNaira(document.discountKobo))}</span></div>`
          : ""
      }
      ${
        document.taxPercent > 0
          ? `<div class="row"><span>Tax (${document.taxPercent}%)</span><span>Included</span></div>`
          : ""
      }
      <div class="row strong"><span>Amount due</span><span>${escapeHtml(formatNaira(document.totalKobo))}</span></div>
    </div>

    <div class="notes">
      <div class="label">Notes & payment</div>
      <div>${escapeHtml(document.notes || "Thank you for your business.")}</div>
      ${
        document.bankDetails
          ? `<div style="margin-top:8px">${escapeHtml(document.bankDetails)}</div>`
          : ""
      }
    </div>

    <div class="footer">${escapeHtml(footerNote)}</div>
  </div>
  ${
    options.autoPrint
      ? `<script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 180);
    });
  </script>`
      : ""
  }
</body>
</html>`;
}

export function exportInvoicePdf(
  document: DocumentDetail,
  branding?: InvoiceBranding,
) {
  const html = buildInvoiceHtml(document, {
    autoPrint: false,
    branding: resolveBranding(branding),
  });
  const frameId = "invoice-naija-pdf-frame";
  window.document.getElementById(frameId)?.remove();

  const iframe = window.document.createElement("iframe");
  iframe.id = frameId;
  iframe.title = `${document.number} PDF`;
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });

  window.document.body.appendChild(iframe);
  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument || frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    iframe.remove();
    throw new Error("Could not prepare the PDF view in this browser.");
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  window.setTimeout(() => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1200);
    }
  }, 300);
}

function safeFilename(value: string) {
  return value.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function waitForFrameReady(frameDocument: Document) {
  return new Promise<void>((resolve) => {
    const finish = () => resolve();
    const fontsReady =
      "fonts" in frameDocument
        ? (frameDocument as Document & { fonts: FontFaceSet }).fonts.ready
        : Promise.resolve();

    const images = Array.from(frameDocument.images || []);
    const imageReady = Promise.all(
      images.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) {
              res();
              return;
            }
            img.onload = () => res();
            img.onerror = () => res();
          }),
      ),
    );

    void Promise.all([fontsReady, imageReady]).then(() => {
      // Give layout/fonts a beat after load.
      window.setTimeout(finish, 120);
    });
  });
}

/**
 * PDF download captures the same HTML used by the on-screen preview,
 * so Download PDF matches what you see.
 */
export async function downloadInvoicePdf(
  document: DocumentDetail,
  brandingInput?: InvoiceBranding,
) {
  // html2canvas-pro supports Chrome's color(srgb …) computed styles.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const brand = resolveBranding(brandingInput);
  const html = buildInvoiceHtml(document, { branding: brand });

  const host = window.document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    background: "#fff",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
  });

  const iframe = window.document.createElement("iframe");
  iframe.title = `${document.number} PDF capture`;
  Object.assign(iframe.style, {
    width: "794px",
    minHeight: "1123px",
    border: "0",
    background: "#fff",
  });
  host.appendChild(iframe);
  window.document.body.appendChild(host);

  try {
    const frameDocument =
      iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDocument) {
      throw new Error("Could not prepare the invoice for PDF.");
    }

    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
    await waitForFrameReady(frameDocument);

    const sheet = frameDocument.querySelector(".sheet") as HTMLElement | null;
    if (!sheet) {
      throw new Error("Invoice layout missing for PDF capture.");
    }

    // Flatten to A4-friendly width for capture.
    sheet.style.width = "794px";
    sheet.style.maxWidth = "794px";
    sheet.style.margin = "0";
    sheet.style.boxSizing = "border-box";

    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 794,
      onclone: (_clonedDoc, clonedElement) => {
        sanitizeCloneColors(sheet, clonedElement as HTMLElement);
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/png", 1);

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 8) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${safeFilename(document.number) || "invoice"}.pdf`);
  } finally {
    host.remove();
  }
}
