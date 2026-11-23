import { DocumentsList } from "@/components/documents/documents-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return <DocumentsList documents={[]} />;
}
