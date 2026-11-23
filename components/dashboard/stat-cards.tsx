import { ClockIcon, DocumentsIcon } from "@/components/app/icons";
import { formatNaira } from "@/lib/money";
import Link from "next/link";
import type { ReactNode } from "react";

type Stat = {
  label: string;
  value: string;
  hint: string;
  href?: string;
  tone?: "default" | "warn" | "brand";
  icon: ReactNode;
};

export function StatCards({
  receivedKobo,
  unpaidKobo,
  overdueCount,
}: {
  receivedKobo: number;
  unpaidKobo: number;
  overdueCount: number;
}) {
  const cards: Stat[] = [
    {
      label: "Received this month",
      value: formatNaira(receivedKobo),
      hint: "Money that came in",
      tone: "brand",
      icon: <span className="text-[13px] font-semibold leading-none">₦</span>,
    },
    {
      label: "Unpaid",
      value: formatNaira(unpaidKobo),
      hint: "Still owed to you",
      tone: "default",
      icon: <DocumentsIcon className="size-4" />,
    },
    {
      label: "Overdue",
      value: String(overdueCount),
      hint: overdueCount === 1 ? "invoice past due" : "invoices past due",
      href: "#overdue",
      tone: overdueCount > 0 ? "warn" : "default",
      icon: <ClockIcon className="size-4" />,
    },
  ];

  return (
    <section className="motion-stagger grid grid-cols-1 gap-3 @[48rem]/main:grid-cols-3 @[48rem]/main:gap-4">
      {cards.map((card) => {
        const shell =
          card.tone === "brand"
            ? "border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--brand)_10%,white)_0%,white_48%,#f7faf7_100%)]"
            : card.tone === "warn"
              ? "border-[color-mix(in_oklab,var(--danger)_20%,var(--border))] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--danger)_9%,white)_0%,white_50%,#fff8f7_100%)]"
              : "border-border bg-[linear-gradient(165deg,#fff_0%,#f7f8f6_100%)]";

        const iconTone =
          card.tone === "brand"
            ? "bg-[color-mix(in_oklab,var(--brand)_14%,white)] text-brand"
            : card.tone === "warn"
              ? "bg-[color-mix(in_oklab,var(--danger)_12%,white)] text-[color-mix(in_oklab,var(--danger)_75%,black)]"
              : "bg-[#eef1ee] text-muted";

        const body = (
          <div
            className={`app-panel relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 @[48rem]/main:p-6 ${shell}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
                {card.label}
              </p>
              <span
                className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${iconTone}`}
              >
                {card.icon}
              </span>
            </div>
            <p
              className={
                card.tone === "brand"
                  ? "mt-3 text-[clamp(1.5rem,4.5cqi,1.875rem)] font-semibold tracking-tight text-brand tabular-nums @[48rem]/main:mt-4"
                  : card.tone === "warn"
                    ? "mt-3 text-[clamp(1.5rem,4.5cqi,1.875rem)] font-semibold tracking-tight text-[color-mix(in_oklab,var(--danger)_80%,black)] tabular-nums @[48rem]/main:mt-4"
                    : "mt-3 text-[clamp(1.5rem,4.5cqi,1.875rem)] font-semibold tracking-tight tabular-nums @[48rem]/main:mt-4"
              }
            >
              {card.value}
            </p>
            <p className="mt-2 text-sm text-muted">{card.hint}</p>
          </div>
        );

        return card.href ? (
          <Link
            key={card.label}
            href={card.href}
            className="block min-w-0 transition-transform active:scale-[0.99]"
          >
            {body}
          </Link>
        ) : (
          <div key={card.label} className="min-w-0">
            {body}
          </div>
        );
      })}
    </section>
  );
}
