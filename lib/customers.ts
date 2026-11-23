export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  documentsCount: number;
  owedKobo: number;
};

/** Empty by default — load a sample pack or add customers in the app. */
export const customers: Customer[] = [];

export function findCustomerByName(list: Customer[], name: string) {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return list.find((customer) => customer.name.toLowerCase() === needle);
}
