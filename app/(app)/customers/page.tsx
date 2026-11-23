import { CustomersView } from "@/components/customers/customers-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return <CustomersView />;
}
