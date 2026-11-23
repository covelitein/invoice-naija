import Link from "next/link";

export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" className="fill-brand" />
      <g fill="white">
        <circle cx="16" cy="9.6" r="4" />
        <circle cx="16" cy="22.4" r="4" />
        <circle cx="9.6" cy="16" r="4" />
        <circle cx="22.4" cy="16" r="4" />
        <circle cx="16" cy="16" r="2" />
      </g>
    </svg>
  );
}

export function Wordmark({ href = "/welcome" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 text-foreground"
    >
      <Mark />
      <span className="text-[15px] font-semibold tracking-tight">
        InvoiceNaija
      </span>
    </Link>
  );
}
