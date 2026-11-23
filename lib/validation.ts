/** Nigerian mobile: 0803… or +234803… → digits starting with 234 */
export function normalizeNgPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length >= 13) return digits.slice(0, 13);
  if (digits.startsWith("0") && digits.length >= 11) {
    return `234${digits.slice(1, 11)}`;
  }
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

export function isValidNgPhone(raw: string): boolean {
  const normalized = normalizeNgPhone(raw);
  return /^234[789]\d{9}$/.test(normalized);
}

export function formatNgPhoneDisplay(raw: string): string {
  const normalized = normalizeNgPhone(raw);
  if (!/^234\d{10}$/.test(normalized)) return raw.trim();
  return `0${normalized.slice(3)}`;
}

export function isValidAccountNumber(raw: string): boolean {
  return /^\d{10}$/.test(raw.replace(/\s/g, ""));
}

export function parseNairaInput(raw: string): number | null {
  const cleaned = raw.replace(/[₦,\s]/g, "").trim();
  if (!cleaned) return 0;
  const value = Number(cleaned);
  if (Number.isNaN(value) || value < 0) return null;
  return value;
}

export function sanitizeOptionalPhone(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed || /^n\/?a$/i.test(trimmed) || trimmed === "-") return "";
  return trimmed;
}
