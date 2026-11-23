export const TOUR_STORAGE_KEY = "invoicenaija.tour";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** CSS selector, usually [data-tour="…"] */
  target: string;
  href?: string;
  placement?: "auto" | "bottom" | "top" | "left" | "right";
};

export const tourSteps: TourStep[] = [
  {
    id: "home",
    title: "Your money at a glance",
    body: "Home shows what came in, what’s unpaid, and who needs a WhatsApp nudge — for any kind of business.",
    target: '[data-tour="home-hero"]',
    href: "/home",
    placement: "bottom",
  },
  {
    id: "new",
    title: "Spin up an invoice fast",
    body: "Tap New document anytime. Casual notes work — Gemini expands them into clear line items you can edit.",
    target: '[data-tour="new-document"]',
    href: "/home",
    placement: "bottom",
  },
  {
    id: "documents",
    title: "Every invoice in one place",
    body: "Filter drafts, sent, and overdue docs. Download a PDF whenever you need a file to attach.",
    target:
      '[data-tour="documents-hero"], [data-tour="nav-documents"]',
    href: "/documents",
    placement: "bottom",
  },
  {
    id: "customers",
    title: "Save customers once",
    body: "Store WhatsApp numbers here. Opening “Invoice” from a customer keeps their phone filled in — even after AI drafting.",
    target:
      '[data-tour="customers-hero"], [data-tour="nav-customers"]',
    href: "/customers",
    placement: "bottom",
  },
  {
    id: "settings",
    title: "Pick your trade",
    body: "Set your industry, bank details, and load a sample pack — fashion, software, retail, construction, and more.",
    target:
      '[data-tour="settings-hero"], [data-tour="nav-settings"]',
    href: "/settings",
    placement: "bottom",
  },
  {
    id: "gemini",
    title: "Draft with a short note",
    body: "Describe the job in plain English. InvoiceNaija turns it into line items and a clear amount due, ready for WhatsApp.",
    target: '[data-tour="gemini-assist"]',
    href: "/documents/new",
    placement: "bottom",
  },
];

export function hasCompletedTour() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "done";
  } catch {
    return true;
  }
}

export function markTourComplete() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "done");
  } catch {
    // ignore quota
  }
}

export function resetTourProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // ignore
  }
}
