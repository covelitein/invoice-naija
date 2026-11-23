export type DocumentStatus =
  | "draft"
  | "sent"
  | "part_paid"
  | "paid"
  | "overdue";

export type DashboardDocument = {
  id: string;
  number: string;
  type: "invoice" | "receipt";
  customer: string;
  phone: string;
  totalKobo: number;
  balanceKobo: number;
  status: DocumentStatus;
  issueDate: string;
  dueDate?: string;
  daysOverdue?: number;
};

export const businessProfile = {
  name: "Amaka Atelier",
  owner: "Amaka Okonkwo",
  email: "amaka@atelier.ng",
  phone: "0803 112 4455",
  plan: "free" as const,
  documentsThisMonth: 3,
  documentLimit: 5,
};

export const dashboardStats = {
  receivedThisMonthKobo: 1_285_000_00,
  unpaidKobo: 645_000_00,
  overdueCount: 3,
};

export const recentDocuments: DashboardDocument[] = [
  {
    id: "1",
    number: "INV-0012",
    type: "invoice",
    customer: "Chioma Adeyemi",
    phone: "08034412290",
    totalKobo: 85_000_00,
    balanceKobo: 45_000_00,
    status: "overdue",
    issueDate: "8 Jan 2026",
    dueDate: "22 Jan 2026",
    daysOverdue: 8,
  },
  {
    id: "2",
    number: "INV-0011",
    type: "invoice",
    customer: "Tunde Bakare",
    phone: "08123456789",
    totalKobo: 320_000_00,
    balanceKobo: 0,
    status: "paid",
    issueDate: "4 Jan 2026",
    dueDate: "18 Jan 2026",
  },
  {
    id: "3",
    number: "INV-0010",
    type: "invoice",
    customer: "Blessing Okoro",
    phone: "07081234567",
    totalKobo: 150_000_00,
    balanceKobo: 75_000_00,
    status: "part_paid",
    issueDate: "2 Jan 2026",
    dueDate: "30 Jan 2026",
  },
  {
    id: "4",
    number: "REC-0004",
    type: "receipt",
    customer: "Ibrahim Musa",
    phone: "09012345678",
    totalKobo: 48_500_00,
    balanceKobo: 0,
    status: "paid",
    issueDate: "29 Dec 2025",
  },
  {
    id: "5",
    number: "INV-0009",
    type: "invoice",
    customer: "Nneka Obi",
    phone: "08055551234",
    totalKobo: 210_000_00,
    balanceKobo: 210_000_00,
    status: "sent",
    issueDate: "27 Dec 2025",
    dueDate: "10 Jan 2026",
  },
  {
    id: "6",
    number: "INV-0008",
    type: "invoice",
    customer: "Kayode Martins",
    phone: "08190001122",
    totalKobo: 95_000_00,
    balanceKobo: 95_000_00,
    status: "overdue",
    issueDate: "20 Dec 2025",
    dueDate: "3 Jan 2026",
    daysOverdue: 13,
  },
  {
    id: "7",
    number: "INV-0007",
    type: "invoice",
    customer: "Fatima Bello",
    phone: "07033334444",
    totalKobo: 60_000_00,
    balanceKobo: 60_000_00,
    status: "draft",
    issueDate: "18 Dec 2025",
  },
  {
    id: "8",
    number: "INV-0006",
    type: "invoice",
    customer: "Emeka Nwosu",
    phone: "08077778888",
    totalKobo: 180_000_00,
    balanceKobo: 180_000_00,
    status: "overdue",
    issueDate: "12 Dec 2025",
    dueDate: "26 Dec 2025",
    daysOverdue: 21,
  },
];

export const overdueDocuments = recentDocuments
  .filter((doc) => doc.status === "overdue")
  .sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0));

export function whatsappReminderUrl(doc: DashboardDocument) {
  const phone = doc.phone.replace(/\D/g, "").replace(/^0/, "234");
  const amount = (doc.totalKobo / 100).toLocaleString("en-NG");
  const message = `Hello ${doc.customer.split(" ")[0] || "there"}, a gentle reminder that invoice ${doc.number} for ₦${amount} is still due. I can resend the PDF on WhatsApp if you need it.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
