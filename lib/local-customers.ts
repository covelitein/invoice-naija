import type { Customer } from "@/lib/customers";
import {
  readStorageJson,
  STORAGE_KEYS,
  writeStorageJson,
  type StorageWriteResult,
} from "@/lib/storage";

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const c = value as Customer;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.phone === "string"
  );
}

export function listLocalCustomers(): Customer[] {
  const raw = readStorageJson<unknown>(STORAGE_KEYS.customers, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isCustomer).map((customer) => ({
    ...customer,
    documentsCount: Number(customer.documentsCount) || 0,
    owedKobo: Number(customer.owedKobo) || 0,
  }));
}

export function saveLocalCustomers(
  customers: Customer[],
): StorageWriteResult {
  return writeStorageJson(STORAGE_KEYS.customers, customers);
}

export function upsertLocalCustomer(
  customer: Customer,
): StorageWriteResult & { customers: Customer[] } {
  const all = listLocalCustomers();
  const index = all.findIndex(
    (item) =>
      item.id === customer.id ||
      item.name.toLowerCase() === customer.name.toLowerCase(),
  );
  const next =
    index >= 0
      ? all.map((item, i) => (i === index ? { ...item, ...customer } : item))
      : [customer, ...all];
  const result = saveLocalCustomers(next);
  return { ...result, customers: next };
}

export function findLocalCustomerByName(name: string) {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return listLocalCustomers().find(
    (customer) => customer.name.toLowerCase() === needle,
  );
}

export function replaceLocalCustomers(
  customers: Customer[],
): StorageWriteResult {
  return saveLocalCustomers(customers);
}
