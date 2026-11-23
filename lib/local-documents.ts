import type { DashboardDocument } from "@/lib/dashboard-data";
import type { DocumentDetail, LineItem } from "@/lib/documents";
import {
  readStorageJson,
  STORAGE_KEYS,
  writeStorageJson,
  type StorageWriteResult,
} from "@/lib/storage";

export type SavedDocument = {
  id: string;
  number: string;
  type: "invoice" | "receipt";
  customer: string;
  phone: string;
  notes: string;
  bankDetails: string;
  discountKobo: number;
  taxPercent: number;
  depositKobo: number;
  items: LineItem[];
  totalKobo: number;
  balanceKobo: number;
  status: "draft" | "sent";
  issueDate: string;
  createdAt: string;
};

export function savedToDashboard(doc: SavedDocument): DashboardDocument {
  return {
    id: doc.id,
    number: doc.number,
    type: doc.type,
    customer: doc.customer,
    phone: doc.phone,
    totalKobo: doc.totalKobo,
    balanceKobo: doc.balanceKobo,
    status: doc.status,
    issueDate: doc.issueDate,
  };
}

export function savedToDetail(doc: SavedDocument): DocumentDetail {
  return {
    ...savedToDashboard(doc),
    notes: doc.notes,
    bankDetails: doc.bankDetails,
    discountKobo: doc.discountKobo,
    taxPercent: doc.taxPercent,
    depositKobo: doc.depositKobo,
    items: doc.items,
  };
}

function isSavedDocument(value: unknown): value is SavedDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as SavedDocument;
  return (
    typeof doc.id === "string" &&
    typeof doc.number === "string" &&
    typeof doc.customer === "string" &&
    Array.isArray(doc.items)
  );
}

function readAll(): SavedDocument[] {
  const raw = readStorageJson<unknown>(STORAGE_KEYS.documents, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSavedDocument);
}

function writeAll(docs: SavedDocument[]): StorageWriteResult {
  return writeStorageJson(STORAGE_KEYS.documents, docs);
}

export function listSavedDocuments() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSavedDocument(id: string) {
  return readAll().find((doc) => doc.id === id);
}

export function replaceSavedDocuments(
  docs: SavedDocument[],
): StorageWriteResult {
  return writeAll(docs);
}

export function saveLocalDocument(
  input: Omit<SavedDocument, "id" | "number" | "createdAt" | "issueDate"> & {
    id?: string;
  },
): { saved: SavedDocument; result: StorageWriteResult } {
  const all = readAll();
  const existing = input.id ? all.find((doc) => doc.id === input.id) : undefined;
  const id = existing?.id || `local-${Date.now()}`;
  const seq = all.length + 1;
  const number =
    existing?.number ||
    `${input.type === "receipt" ? "REC" : "INV"}-${String(seq).padStart(4, "0")}`;
  const issueDate =
    existing?.issueDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const saved: SavedDocument = {
    ...input,
    id,
    number,
    issueDate,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  const next = existing
    ? all.map((doc) => (doc.id === id ? saved : doc))
    : [saved, ...all];
  const result = writeAll(next);
  return { saved, result };
}

export function computeDashboardFromSaved(docs: SavedDocument[]) {
  const dashboard = docs.map(savedToDashboard);
  const unpaidKobo = docs.reduce((sum, doc) => sum + doc.balanceKobo, 0);
  const receivedThisMonthKobo = docs
    .filter((doc) => doc.status === "sent" && doc.balanceKobo === 0)
    .reduce((sum, doc) => sum + doc.totalKobo, 0);
  const overdue = dashboard.filter(
    (doc) => doc.balanceKobo > 0 && doc.status === "sent",
  );
  return {
    documents: dashboard,
    recentDocuments: dashboard.slice(0, 8),
    overdueDocuments: overdue.slice(0, 8),
    stats: {
      receivedThisMonthKobo,
      unpaidKobo,
      overdueCount: overdue.length,
    },
    documentsThisMonth: docs.length,
  };
}
