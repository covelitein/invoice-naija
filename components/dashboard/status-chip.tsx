import type { DocumentStatus } from "@/lib/dashboard-data";

const labels: Record<DocumentStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  part_paid: "Part-paid",
  paid: "Paid",
  overdue: "Overdue",
};

const tones: Record<DocumentStatus, string> = {
  draft: "bg-[#f4f4f4] text-muted",
  sent: "bg-[color-mix(in_oklab,var(--accent)_14%,white)] text-[color-mix(in_oklab,var(--accent)_70%,black)]",
  part_paid:
    "bg-[color-mix(in_oklab,var(--warning)_18%,white)] text-[color-mix(in_oklab,var(--warning)_55%,black)]",
  paid: "bg-[color-mix(in_oklab,var(--brand)_14%,white)] text-brand",
  overdue:
    "bg-[color-mix(in_oklab,var(--danger)_14%,white)] text-[color-mix(in_oklab,var(--danger)_70%,black)]",
};

export function StatusChip({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[status]}`}
    >
      {labels[status]}
    </span>
  );
}
