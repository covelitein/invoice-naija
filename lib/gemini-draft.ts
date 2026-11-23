import { toKobo } from "@/lib/money";
import type { Industry } from "@/lib/settings";
import { sanitizeOptionalPhone } from "@/lib/validation";

export type GeminiDraftLine = {
  description: string;
  quantity: number;
  unitNaira: number;
};

export type GeminiDraftResult = {
  source: "gemini" | "local";
  type: "invoice" | "receipt";
  customerName: string;
  phone?: string;
  notes?: string;
  discountNaira: number;
  taxPercent: number;
  depositNaira: number;
  items: GeminiDraftLine[];
  summary: string;
};

type Phase = { label: string; weight: number };

const PHASES: Record<Exclude<Industry, "general"> | "project", Phase[]> = {
  software: [
    { label: "Discovery & requirements workshop", weight: 0.12 },
    { label: "UI/UX design & clickable prototype", weight: 0.15 },
    { label: "Backend API & business logic", weight: 0.28 },
    { label: "Database, auth & integrations", weight: 0.18 },
    { label: "QA, UAT support & bug fixes", weight: 0.12 },
    { label: "Deployment, training & handover", weight: 0.1 },
    { label: "30-day post-launch support", weight: 0.05 },
  ],
  fashion: [
    { label: "Fabric consultation & measurement", weight: 0.15 },
    { label: "Cutting & primary construction", weight: 0.35 },
    { label: "Fitting & alterations", weight: 0.25 },
    { label: "Finishing, pressing & packaging", weight: 0.25 },
  ],
  retail: [
    { label: "Product / stock supply", weight: 0.7 },
    { label: "Packaging", weight: 0.1 },
    { label: "Delivery / logistics", weight: 0.2 },
  ],
  construction: [
    { label: "Site mobilization", weight: 0.15 },
    { label: "Materials", weight: 0.35 },
    { label: "Labour & craftsmanship", weight: 0.35 },
    { label: "Cleanup & handover", weight: 0.15 },
  ],
  beauty: [
    { label: "Primary service package", weight: 0.55 },
    { label: "Products & add-ons", weight: 0.25 },
    { label: "Booking / finishing fee", weight: 0.2 },
  ],
  education: [
    { label: "Tuition / training fee", weight: 0.7 },
    { label: "Materials / resources", weight: 0.2 },
    { label: "Registration / admin", weight: 0.1 },
  ],
  professional: [
    { label: "Discovery & scoping", weight: 0.2 },
    { label: "Core advisory / delivery", weight: 0.55 },
    { label: "Revisions & documentation", weight: 0.25 },
  ],
  project: [
    { label: "Discovery & planning", weight: 0.2 },
    { label: "Core delivery", weight: 0.45 },
    { label: "Review & revisions", weight: 0.2 },
    { label: "Handover & support", weight: 0.15 },
  ],
};

const INDUSTRY_PROMPTS: Record<Industry, { example: string; placeholder: string }> =
  {
    general: {
      example:
        "Invoice for event catering, 80 plates at ₦4,500, deposit ₦100k, customer Mrs Okon 0803…",
      placeholder:
        "e.g. Invoice for catering 80 plates · ₦4,500 each · deposit 100k",
    },
    fashion: {
      example:
        "Invoice Chioma for agbada and 2 aso-ebi sets, looking at 180-250k, deposit 80k, phone 08034412290",
      placeholder:
        "e.g. Bridal fitting package ~₦150k, deposit 50k, customer Blessing",
    },
    software: {
      example:
        "please i need an invoice for a real estate management software. I was contacted to build one as a software dev looking at 1-2million",
      placeholder:
        "e.g. School portal build, looking at 800k–1.2m, deposit 200k",
    },
    retail: {
      example:
        "Receipt for Mama Ngozi: 10 cartons Indomie ₦8,500 each, delivery ₦6,000, paid in full",
      placeholder: "e.g. Wholesale restock · 6 cartons · delivery Lagos",
    },
    construction: {
      example:
        "Invoice for bathroom tiling in Lekki, labour and materials looking at 400-500k, mobilization deposit 150k",
      placeholder: "e.g. Fence casting · labour + materials · deposit 200k",
    },
    beauty: {
      example:
        "Invoice Funke for bridal glam package makeup + gele + hair, 65k, deposit 40k",
      placeholder: "e.g. Bridal makeup package ₦65k, deposit 40k",
    },
    education: {
      example:
        "Invoice for JAMB prep 8 weeks tuition 80k plus materials 20k, deposit 40k for the Danladis",
      placeholder: "e.g. Bootcamp tuition ₦120k, registration 10k",
    },
    professional: {
      example:
        "Invoice GreenLeaf Agro for January retainer 150k and CAC filing 50k, VAT 7.5%, deposit 100k",
      placeholder: "e.g. Monthly retainer ₦150k + filing support",
    },
  };

export function industryAssistCopy(industry: Industry) {
  return INDUSTRY_PROMPTS[industry] || INDUSTRY_PROMPTS.general;
}

function parseLooseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase();
  const match = cleaned.match(/^([\d.]+)\s*(million|m|k|thousand)?$/);
  if (!match) return null;
  let value = Number(match[1]);
  if (Number.isNaN(value)) return null;
  const unit = match[2];
  if (unit === "million" || unit === "m") value *= 1_000_000;
  else if (unit === "k" || unit === "thousand") value *= 1_000;
  return value;
}

function parseBudgetRange(text: string): { low: number; high: number } | null {
  const range = text.match(
    /(?:₦|ngn|naira)?\s*([\d,.]+)\s*(million|m|k|thousand)?\s*(?:-|–|to)\s*(?:₦|ngn|naira)?\s*([\d,.]+)\s*(million|m|k|thousand)?/i,
  );
  if (!range) return null;
  const leftUnit = range[2] || range[4] || "";
  const rightUnit = range[4] || range[2] || "";
  const low = parseLooseAmount(`${range[1]}${leftUnit}`);
  const high = parseLooseAmount(`${range[3]}${rightUnit}`);
  if (low == null || high == null || low <= 0 || high <= 0) return null;
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

function parseSingleBudget(text: string): number | null {
  const million = text.match(/(?:₦|ngn|naira)?\s*([\d,.]+)\s*(million|m)\b/i);
  if (million) return parseLooseAmount(`${million[1]}${million[2]}`);
  const thousands = text.match(/(?:₦|ngn|naira)?\s*([\d,.]+)\s*(k|thousand)\b/i);
  if (thousands) return parseLooseAmount(`${thousands[1]}${thousands[2]}`);
  const plain = text.match(/₦\s*([\d,]+(?:\.\d{1,2})?)/);
  if (plain) return parseLooseAmount(plain[1]);
  return null;
}

function roundToThousand(value: number) {
  return Math.max(1_000, Math.round(value / 1_000) * 1_000);
}

function splitBudget(total: number, phases: Phase[]) {
  const raw = phases.map((phase) => ({
    description: phase.label,
    quantity: 1,
    unitNaira: roundToThousand(total * phase.weight),
  }));
  const sum = raw.reduce((acc, item) => acc + item.unitNaira, 0);
  const drift = total - sum;
  if (raw.length > 0 && drift !== 0) {
    const idx = Math.min(2, raw.length - 1);
    raw[idx].unitNaira = Math.max(1_000, raw[idx].unitNaira + drift);
  }
  return raw;
}

export function detectIndustryFromPrompt(
  prompt: string,
  fallback: Industry = "general",
): Industry {
  const lower = prompt.toLowerCase();
  if (
    /(software|app|web|saas|platform|mvp|website|portal|dashboard|erp|crm|developer|dev\b)/i.test(
      lower,
    )
  ) {
    return "software";
  }
  if (
    /(dress|agbada|aso-?ebi|tailor|ankara|fitting|alteration|gele|bridal wear)/i.test(
      lower,
    )
  ) {
    return "fashion";
  }
  if (/(carton|wholesale|stock|retail|shop|provision|goods)/i.test(lower)) {
    return "retail";
  }
  if (
    /(tiling|builder|construction|labour|cement|electrician|plumber|welding)/i.test(
      lower,
    )
  ) {
    return "construction";
  }
  if (/(salon|makeup|spa|barber|manicure|glow|bridal glam)/i.test(lower)) {
    return "beauty";
  }
  if (/(tuition|tutor|school|jamb|bootcamp|training|course)/i.test(lower)) {
    return "education";
  }
  if (
    /(retainer|advisory|consult|accounting|legal|filing|cac)/i.test(lower)
  ) {
    return "professional";
  }
  return fallback;
}

export function looksLikeProjectBrief(prompt: string, industry?: Industry) {
  const detected = industry || detectIndustryFromPrompt(prompt);
  if (detected !== "general" && detected !== "retail") return true;
  return /(project|build|develop|package|milestone|phase)/i.test(prompt);
}

function inferCustomerName(prompt: string, industry: Industry) {
  const properName =
    /([A-ZÀ-ÖØ-öø-ÿ][\w.'-]*(?:\s+[A-ZÀ-ÖØ-öø-ÿ][\w.']*){0,2})/;
  const nameMatch =
    prompt.match(new RegExp(`(?:invoice|receipt)\\s+${properName.source}`)) ||
    prompt.match(
      new RegExp(`(?:for|to|customer|client)\\s+${properName.source}`),
    );
  const candidate = nameMatch?.[1]?.trim();
  if (candidate && !/^(a|an|the|one|my|our|this)$/i.test(candidate)) {
    return candidate;
  }
  const defaults: Record<Industry, string> = {
    general: "Valued customer",
    fashion: "Fashion client",
    software: "Software project client",
    retail: "Retail buyer",
    construction: "Project client",
    beauty: "Salon client",
    education: "Learner / parent",
    professional: "Advisory client",
  };
  if (/real\s*estate/i.test(prompt)) return "Real Estate Management Client";
  return defaults[industry];
}

function expandItems(
  prompt: string,
  industry: Industry,
  budget: number,
): GeminiDraftLine[] {
  const key =
    industry === "general"
      ? looksLikeProjectBrief(prompt)
        ? "project"
        : null
      : industry;
  if (!key) {
    return [
      {
        description: "Professional service",
        quantity: 1,
        unitNaira: budget,
      },
    ];
  }
  const phases = PHASES[key];
  return splitBudget(budget, phases);
}

export function draftInvoiceLocally(
  prompt: string,
  industry: Industry = "general",
): GeminiDraftResult {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const type = lower.includes("receipt") ? "receipt" : "invoice";
  const resolvedIndustry = detectIndustryFromPrompt(text, industry);

  const phoneMatch = text.match(/\b0\d{10}\b/);
  const phone = phoneMatch?.[0];

  const depositMatch = lower.match(
    /deposit(?:\s*(?:of|paid))?\s*(?:₦|ngn|naira)?\s*([\d,.]+(?:\.\d{1,2})?\s*(?:million|m|k|thousand)?)/i,
  );
  const depositNaira = depositMatch
    ? (parseLooseAmount(depositMatch[1].replace(/\s+/g, "")) ?? 0)
    : 0;

  const range = parseBudgetRange(text);
  const single = parseSingleBudget(text);
  const primary =
    range != null
      ? roundToThousand((range.low + range.high) / 2)
      : single != null && single !== depositNaira
        ? roundToThousand(single)
        : resolvedIndustry === "software"
          ? 1_500_000
          : 50_000;

  const items = expandItems(text, resolvedIndustry, primary);
  const taxPercent =
    /vat|tax|wht|withholding/i.test(lower) ||
    resolvedIndustry === "software" ||
    resolvedIndustry === "professional"
      ? 7.5
      : 0;

  return {
    source: "local",
    type,
    customerName: inferCustomerName(text, resolvedIndustry),
    phone,
    notes: `Scoped from your note for a ${resolvedIndustry} job. Balance due after agreed milestones; pricing in NGN.`,
    discountNaira: 0,
    taxPercent,
    depositNaira,
    items,
    summary: `Drafted a detailed ${type} (${resolvedIndustry}) from your note.`,
  };
}

export function isUsableGeminiDraft(value: unknown): value is Partial<GeminiDraftResult> {
  return !!value && typeof value === "object";
}

export function normalizeGeminiDraft(
  parsed: Partial<GeminiDraftResult>,
  prompt: string,
  industry: Industry,
): GeminiDraftResult {
  const fallback = draftInvoiceLocally(prompt, industry);
  const phone = sanitizeOptionalPhone(
    typeof parsed.phone === "string" ? parsed.phone : "",
  );
  let items =
    Array.isArray(parsed.items) && parsed.items.length > 0
      ? parsed.items.map((item) => ({
          description: String(item?.description || "Service"),
          quantity: Math.max(1, Number(item?.quantity) || 1),
          unitNaira: Math.max(0, Number(item?.unitNaira) || 0),
        }))
      : fallback.items;

  if (items.length === 1 && looksLikeProjectBrief(prompt, industry)) {
    items = fallback.items;
  }

  return {
    source: "gemini",
    type: parsed.type === "receipt" ? "receipt" : "invoice",
    customerName: parsed.customerName || fallback.customerName,
    phone: phone || undefined,
    notes: parsed.notes || fallback.notes,
    discountNaira: Number(parsed.discountNaira) || 0,
    taxPercent: Number(parsed.taxPercent) || 0,
    depositNaira: Number(parsed.depositNaira) || 0,
    items,
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : fallback.summary,
  };
}

export function draftToFormValues(draft: GeminiDraftResult) {
  return {
    type: draft.type,
    customerName: draft.customerName,
    phone: sanitizeOptionalPhone(draft.phone),
    notes: draft.notes ?? "",
    discountKobo: toKobo(draft.discountNaira),
    taxPercent: draft.taxPercent,
    items: draft.items.map((item, index) => ({
      id: `ai-${index + 1}`,
      description: item.description,
      quantity: item.quantity,
      unitKobo: toKobo(item.unitNaira),
    })),
  };
}

export function geminiSystemPrompt(industry: Industry) {
  return `You draft professional Nigerian naira invoices/receipts for InvoiceNaija (WhatsApp-first SMB invoicing).
Preferred business industry context: ${industry}.

Return ONLY JSON with keys:
type ("invoice"|"receipt"), customerName, phone, notes, discountNaira, taxPercent, depositNaira, items[{description,quantity,unitNaira}], summary.

Rules:
- Never return a single vague lump-sum line when the note describes a project, package, retainership, or multi-step job. Expand into 3–7 concrete deliverable line items for that trade.
- Match the industry: fashion (fittings/sewing), software (phases), retail (SKU×qty + delivery), construction (mobilization/materials/labour), beauty (service + add-ons), education (tuition + materials), professional (retainer/advisory).
- Split any budget range across items (e.g. "1-2 million" → mid-range total). "million"/"m" = ×1,000,000; "k" = ×1,000.
- If no named person/company is given, invent a short professional customerName from the domain — never "New customer".
- phone: Nigerian WhatsApp if present; otherwise "" — never "N/A".
- taxPercent: 7.5 only when VAT/tax mentioned or typical for B2B software/professional; else 0.
- Always set depositNaira to 0. InvoiceNaija quotes the full amount due and does not track deposits or partial payments — put any installment wording in notes/items instead.
- notes: 1–2 polished footer sentences, not a raw copy of the user note.
- Amounts are plain numbers in naira. No markdown.`;
}
