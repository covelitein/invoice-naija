import type { Customer } from "@/lib/customers";
import type { SavedDocument } from "@/lib/local-documents";
import type { AppSettings, Industry } from "@/lib/settings";
import { defaultSettings } from "@/lib/settings";

export type SamplePack = {
  id: string;
  industry: Industry;
  label: string;
  description: string;
  settings: Partial<AppSettings>;
  customers: Customer[];
  documents: SavedDocument[];
};

function doc(
  partial: Omit<SavedDocument, "createdAt"> & { createdAt?: string },
): SavedDocument {
  return {
    ...partial,
    createdAt: partial.createdAt || "2026-01-10T10:00:00.000Z",
  };
}

export const samplePacks: SamplePack[] = [
  {
    id: "fashion",
    industry: "fashion",
    label: "Fashion & tailoring",
    description: "Atelier-style fittings, aso-ebi, and alterations.",
    settings: {
      businessName: "Amaka Atelier",
      ownerName: "Amaka Okonkwo",
      email: "amaka@atelier.ng",
      phone: "08031124455",
      bankName: "GTBank",
      accountName: "Amaka Atelier",
      accountNumber: "0123456789",
      industry: "fashion",
    },
    customers: [
      {
        id: "c1",
        name: "Chioma Adeyemi",
        phone: "08034412290",
        email: "chioma@email.com",
        notes: "Prefers WhatsApp reminders",
        documentsCount: 2,
        owedKobo: 45_000_00,
      },
      {
        id: "c2",
        name: "Tunde Bakare",
        phone: "08123456789",
        documentsCount: 1,
        owedKobo: 0,
      },
      {
        id: "c3",
        name: "Blessing Okoro",
        phone: "07081234567",
        documentsCount: 1,
        owedKobo: 75_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-f1",
        number: "INV-0012",
        type: "invoice",
        customer: "Chioma Adeyemi",
        phone: "08034412290",
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
        totalKobo: 85_000_00,
        balanceKobo: 45_000_00,
        status: "sent",
        issueDate: "8 Jan 2026",
      }),
      doc({
        id: "sample-f2",
        number: "INV-0013",
        type: "invoice",
        customer: "Tunde Bakare",
        phone: "08123456789",
        notes: "Corporate uniforms.",
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
        totalKobo: 320_000_00,
        balanceKobo: 0,
        status: "sent",
        issueDate: "12 Jan 2026",
      }),
    ],
  },
  {
    id: "software",
    industry: "software",
    label: "Software & freelancers",
    description: "Web apps, retainers, and milestone builds.",
    settings: {
      businessName: "Lagos Code Studio",
      ownerName: "Tola Adebayo",
      email: "tola@lagoscode.ng",
      phone: "08095551234",
      bankName: "Access Bank",
      accountName: "Lagos Code Studio",
      accountNumber: "1234567890",
      industry: "software",
      defaultTaxPercent: 7.5,
    },
    customers: [
      {
        id: "s1",
        name: "Horizon Realty",
        phone: "08021112233",
        notes: "Property ops platform",
        documentsCount: 1,
        owedKobo: 1_112_500_00,
      },
      {
        id: "s2",
        name: "Adaeze Nwosu",
        phone: "08170009988",
        documentsCount: 1,
        owedKobo: 0,
      },
    ],
    documents: [
      doc({
        id: "sample-s1",
        number: "INV-0101",
        type: "invoice",
        customer: "Horizon Realty",
        phone: "08021112233",
        notes: "Milestone invoice for property management MVP.",
        bankDetails: "Lagos Code Studio · Access Bank · 1234567890",
        discountKobo: 0,
        taxPercent: 7.5,
        depositKobo: 500_000_00,
        items: [
          {
            id: "i1",
            description: "Discovery & requirements",
            quantity: 1,
            unitKobo: 180_000_00,
          },
          {
            id: "i2",
            description: "UI/UX design",
            quantity: 1,
            unitKobo: 220_000_00,
          },
          {
            id: "i3",
            description: "Backend API & workflows",
            quantity: 1,
            unitKobo: 420_000_00,
          },
          {
            id: "i4",
            description: "QA & deployment",
            quantity: 1,
            unitKobo: 180_000_00,
          },
        ],
        totalKobo: 1_075_000_00,
        balanceKobo: 575_000_00,
        status: "sent",
        issueDate: "5 Feb 2026",
      }),
    ],
  },
  {
    id: "retail",
    industry: "retail",
    label: "Retail & trading",
    description: "Phone accessories, provisions, and bulk orders.",
    settings: {
      businessName: "BrightMart Stores",
      ownerName: "Ifeanyi Okeke",
      email: "hello@brightmart.ng",
      phone: "08034445566",
      bankName: "Zenith Bank",
      accountName: "BrightMart Stores",
      accountNumber: "2087654321",
      industry: "retail",
    },
    customers: [
      {
        id: "r1",
        name: "Mama Ngozi Shop",
        phone: "08056667788",
        documentsCount: 1,
        owedKobo: 42_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-r1",
        number: "INV-0201",
        type: "invoice",
        customer: "Mama Ngozi Shop",
        phone: "08056667788",
        notes: "Wholesale restock.",
        bankDetails: "BrightMart Stores · Zenith Bank · 2087654321",
        discountKobo: 5_000_00,
        taxPercent: 0,
        depositKobo: 20_000_00,
        items: [
          {
            id: "i1",
            description: "Indomie carton (40 packs)",
            quantity: 6,
            unitKobo: 8_500_00,
          },
          {
            id: "i2",
            description: "Delivery within Lagos",
            quantity: 1,
            unitKobo: 6_000_00,
          },
        ],
        totalKobo: 52_000_00,
        balanceKobo: 32_000_00,
        status: "sent",
        issueDate: "2 Feb 2026",
      }),
    ],
  },
  {
    id: "construction",
    industry: "construction",
    label: "Construction & artisans",
    description: "Labour, materials, and mobilization deposits.",
    settings: {
      businessName: "SolidBuild NG",
      ownerName: "Chinedu Eze",
      email: "jobs@solidbuild.ng",
      phone: "08097778899",
      bankName: "UBA",
      accountName: "SolidBuild NG",
      accountNumber: "1029384756",
      industry: "construction",
    },
    customers: [
      {
        id: "b1",
        name: "Mrs. Aisha Bello",
        phone: "08012223344",
        documentsCount: 1,
        owedKobo: 450_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-b1",
        number: "INV-0301",
        type: "invoice",
        customer: "Mrs. Aisha Bello",
        phone: "08012223344",
        notes: "Phase 1 tiling — Lekki duplex.",
        bankDetails: "SolidBuild NG · UBA · 1029384756",
        discountKobo: 0,
        taxPercent: 0,
        depositKobo: 300_000_00,
        items: [
          {
            id: "i1",
            description: "Site mobilization",
            quantity: 1,
            unitKobo: 80_000_00,
          },
          {
            id: "i2",
            description: "Labour — bathroom tiling",
            quantity: 1,
            unitKobo: 220_000_00,
          },
          {
            id: "i3",
            description: "Materials handling & cleanup",
            quantity: 1,
            unitKobo: 150_000_00,
          },
        ],
        totalKobo: 450_000_00,
        balanceKobo: 150_000_00,
        status: "sent",
        issueDate: "18 Jan 2026",
      }),
    ],
  },
  {
    id: "beauty",
    industry: "beauty",
    label: "Beauty & wellness",
    description: "Salon packages, products, and booking deposits.",
    settings: {
      businessName: "Glow House Spa",
      ownerName: "Zainab Yusuf",
      email: "book@glowhouse.ng",
      phone: "08123334455",
      bankName: "Opay",
      accountName: "Glow House Spa",
      accountNumber: "9012345678",
      industry: "beauty",
    },
    customers: [
      {
        id: "be1",
        name: "Funke Ade",
        phone: "08068889900",
        documentsCount: 1,
        owedKobo: 25_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-be1",
        number: "INV-0401",
        type: "invoice",
        customer: "Funke Ade",
        phone: "08068889900",
        notes: "Bridal glam package.",
        bankDetails: "Glow House Spa · Opay · 9012345678",
        discountKobo: 0,
        taxPercent: 0,
        depositKobo: 40_000_00,
        items: [
          {
            id: "i1",
            description: "Bridal makeup & gele",
            quantity: 1,
            unitKobo: 45_000_00,
          },
          {
            id: "i2",
            description: "Hair styling",
            quantity: 1,
            unitKobo: 20_000_00,
          },
        ],
        totalKobo: 65_000_00,
        balanceKobo: 25_000_00,
        status: "sent",
        issueDate: "20 Jan 2026",
      }),
    ],
  },
  {
    id: "education",
    industry: "education",
    label: "Education & training",
    description: "Term fees, bootcamps, and registration deposits.",
    settings: {
      businessName: "BrightPath Tutors",
      ownerName: "Kunle Mensah",
      email: "learn@brightpath.ng",
      phone: "08045556677",
      bankName: "First Bank",
      accountName: "BrightPath Tutors",
      accountNumber: "3098765432",
      industry: "education",
    },
    customers: [
      {
        id: "e1",
        name: "Mr. & Mrs. Danladi",
        phone: "08019998877",
        documentsCount: 1,
        owedKobo: 60_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-e1",
        number: "INV-0501",
        type: "invoice",
        customer: "Mr. & Mrs. Danladi",
        phone: "08019998877",
        notes: "JAMB prep — second term.",
        bankDetails: "BrightPath Tutors · First Bank · 3098765432",
        discountKobo: 0,
        taxPercent: 0,
        depositKobo: 40_000_00,
        items: [
          {
            id: "i1",
            description: "Tuition — 8 weeks",
            quantity: 1,
            unitKobo: 80_000_00,
          },
          {
            id: "i2",
            description: "Study materials pack",
            quantity: 1,
            unitKobo: 20_000_00,
          },
        ],
        totalKobo: 100_000_00,
        balanceKobo: 60_000_00,
        status: "sent",
        issueDate: "4 Feb 2026",
      }),
    ],
  },
  {
    id: "professional",
    industry: "professional",
    label: "Professional services",
    description: "Consulting, accounting, and advisory retainers.",
    settings: {
      businessName: "Northstar Advisory",
      ownerName: "Halima Sule",
      email: "office@northstar.ng",
      phone: "08072223344",
      bankName: "Stanbic IBTC",
      accountName: "Northstar Advisory",
      accountNumber: "0011223344",
      industry: "professional",
      defaultTaxPercent: 7.5,
    },
    customers: [
      {
        id: "p1",
        name: "GreenLeaf Agro Ltd",
        phone: "08033334455",
        documentsCount: 1,
        owedKobo: 215_000_00,
      },
    ],
    documents: [
      doc({
        id: "sample-p1",
        number: "INV-0601",
        type: "invoice",
        customer: "GreenLeaf Agro Ltd",
        phone: "08033334455",
        notes: "Q1 advisory retainer.",
        bankDetails: "Northstar Advisory · Stanbic IBTC · 0011223344",
        discountKobo: 0,
        taxPercent: 7.5,
        depositKobo: 100_000_00,
        items: [
          {
            id: "i1",
            description: "Monthly retainer — Jan",
            quantity: 1,
            unitKobo: 150_000_00,
          },
          {
            id: "i2",
            description: "CAC filing support",
            quantity: 1,
            unitKobo: 50_000_00,
          },
        ],
        totalKobo: 215_000_00,
        balanceKobo: 115_000_00,
        status: "sent",
        issueDate: "28 Jan 2026",
      }),
    ],
  },
];

export function getSamplePack(id: string) {
  return samplePacks.find((pack) => pack.id === id);
}

export function settingsFromPack(pack: SamplePack): AppSettings {
  return {
    ...defaultSettings,
    ...pack.settings,
    industry: pack.industry,
    samplePackId: pack.id,
    geminiEnabled: true,
    aiProvider: "gemini",
    geminiAutoFillNotes: true,
    plan: "free",
  };
}
