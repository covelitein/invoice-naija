export const STORAGE_KEYS = {
  settings: "invoicenaija.settings",
  documents: "invoicenaija.documents",
  customers: "invoicenaija.customers",
  featureRequests: "invoicenaija.feature-requests",
  meta: "invoicenaija.meta",
} as const;

export const STORAGE_VERSION = 1;

export type StorageWriteResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "unavailable" | "unknown"; message: string };

type Envelope<T> = {
  version: number;
  data: T;
};

export function readStorageJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Envelope<T> | T;
    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      "data" in parsed
    ) {
      return (parsed as Envelope<T>).data;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStorageJson<T>(key: string, data: T): StorageWriteResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "unavailable",
      message: "Storage is only available in the browser.",
    };
  }

  try {
    const envelope: Envelope<T> = { version: STORAGE_VERSION, data };
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return {
      ok: false,
      reason: isQuota ? "quota" : "unknown",
      message: isQuota
        ? "This device is out of storage space. Delete old documents or clear sample data."
        : "Could not save on this device.",
    };
  }
}

export function clearAppStorage() {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}
