import { DocumentDetailLoader } from "@/components/documents/document-detail-loader";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: id ? `Document ${id}` : "Document",
  };
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;
  return <DocumentDetailLoader id={id} />;
}
