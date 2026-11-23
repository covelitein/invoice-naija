import {
  type DashboardDocument,
  recentDocuments,
  whatsappReminderUrl,
} from "@/lib/dashboard-data";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitKobo: number;
};

export type DocumentDetail = DashboardDocument & {
  customerId?: string;
  notes?: string;
  bankDetails?: string;
  discountKobo: number;
  taxPercent: number;
  depositKobo: number;
  items: LineItem[];
};

const extras: Record<
  string,
  Omit<DocumentDetail, keyof DashboardDocument>
> = {
  "1": {
    customerId: "c1",
    notes: "Final fitting included.",
    bankDetails: "Amaka Atelier · GTBank · 0123456789",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 40_000_00,
    items: [
      {
        id: "i1",
        description: "Ankara dress alteration",
        quantity: 1,
        unitKobo: 55_000_00,
      },
      {
        id: "i2",
        description: "Bead embellishment",
        quantity: 1,
        unitKobo: 30_000_00,
      },
    ],
  },
  "2": {
    customerId: "c2",
    bankDetails: "Amaka Atelier · GTBank · 0123456789",
    discountKobo: 20_000_00,
    taxPercent: 0,
    depositKobo: 320_000_00,
    items: [
      {
        id: "i1",
        description: "Corporate uniform set",
        quantity: 8,
        unitKobo: 42_500_00,
      },
    ],
  },
  "3": {
    customerId: "c3",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 75_000_00,
    items: [
      {
        id: "i1",
        description: "Bridal fitting package",
        quantity: 1,
        unitKobo: 150_000_00,
      },
    ],
  },
  "4": {
    customerId: "c4",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 48_500_00,
    items: [
      {
        id: "i1",
        description: "Agbada steam and press",
        quantity: 1,
        unitKobo: 48_500_00,
      },
    ],
  },
  "5": {
    customerId: "c5",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 0,
    items: [
      {
        id: "i1",
        description: "Ready-to-wear capsule",
        quantity: 3,
        unitKobo: 70_000_00,
      },
    ],
  },
  "6": {
    customerId: "c6",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 0,
    items: [
      {
        id: "i1",
        description: "Suit alterations",
        quantity: 1,
        unitKobo: 95_000_00,
      },
    ],
  },
  "7": {
    customerId: "c7",
    notes: "Waiting on fabric choice.",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 0,
    items: [
      {
        id: "i1",
        description: "Reception dress draft",
        quantity: 1,
        unitKobo: 60_000_00,
      },
    ],
  },
  "8": {
    customerId: "c8",
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: 0,
    items: [
      {
        id: "i1",
        description: "Native wear set",
        quantity: 2,
        unitKobo: 90_000_00,
      },
    ],
  },
};

export function getDocuments() {
  return recentDocuments;
}

export function getDocumentById(id: string): DocumentDetail | undefined {
  const base = recentDocuments.find((doc) => doc.id === id);
  if (!base) return undefined;
  const detail = extras[id] ?? {
    discountKobo: 0,
    taxPercent: 0,
    depositKobo: Math.max(0, base.totalKobo - base.balanceKobo),
    items: [
      {
        id: "i1",
        description: `${base.type === "receipt" ? "Receipt" : "Invoice"} total`,
        quantity: 1,
        unitKobo: base.totalKobo,
      },
    ],
  };
  return { ...base, ...detail };
}

export function computeTotals({
  items,
  discountKobo,
  taxPercent,
}: {
  items: LineItem[];
  discountKobo: number;
  taxPercent: number;
  /** @deprecated Ignored — InvoiceNaija quotes amount due, it does not track deposits. */
  depositKobo?: number;
}) {
  const subtotalKobo = items.reduce(
    (sum, item) => sum + item.quantity * item.unitKobo,
    0,
  );
  const afterDiscount = Math.max(0, subtotalKobo - discountKobo);
  const taxKobo = Math.round(afterDiscount * (taxPercent / 100));
  const totalKobo = afterDiscount + taxKobo;
  // Amount due is the invoice total — no payment / deposit tracking.
  return { subtotalKobo, taxKobo, totalKobo, balanceKobo: totalKobo };
}

export { whatsappReminderUrl };
