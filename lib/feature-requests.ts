import {
  readStorageJson,
  STORAGE_KEYS,
  writeStorageJson,
  type StorageWriteResult,
} from "@/lib/storage";

export type FeatureRequest = {
  id: string;
  text: string;
  createdAt: string;
};

function readAll(): FeatureRequest[] {
  const raw = readStorageJson<unknown>(STORAGE_KEYS.featureRequests, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is FeatureRequest =>
      !!item &&
      typeof item === "object" &&
      typeof (item as FeatureRequest).id === "string" &&
      typeof (item as FeatureRequest).text === "string",
  );
}

export function listFeatureRequests() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveFeatureRequest(
  text: string,
): { ok: true; request: FeatureRequest } | { ok: false; message: string } {
  const trimmed = text.trim();
  if (trimmed.length < 8) {
    return {
      ok: false,
      message: "Tell us a bit more — at least a short sentence.",
    };
  }
  if (trimmed.length > 2000) {
    return { ok: false, message: "Keep requests under 2,000 characters." };
  }

  const request: FeatureRequest = {
    id: `feat-${Date.now()}`,
    text: trimmed,
    createdAt: new Date().toISOString(),
  };
  const next = [request, ...readAll()].slice(0, 40);
  const result: StorageWriteResult = writeStorageJson(
    STORAGE_KEYS.featureRequests,
    next,
  );
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return { ok: true, request };
}

export function featureRequestWhatsAppUrl(text: string) {
  const message = `Hi InvoiceNaija team — feature request:\n\n${text.trim()}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
