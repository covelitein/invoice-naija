import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Send a professional invoice or receipt on WhatsApp in 60 seconds.",
};

export default function WelcomePage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-brand">For small businesses</p>
        <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
          Send a professional invoice on WhatsApp in 60 seconds.
        </h1>
        <p className="text-base leading-7 text-muted">
          Write the quote or invoice, show the amount due, then share
          on WhatsApp. Built for traders, freelancers, shops, builders, salons,
          and every other Nigerian SMB.
        </p>
      </div>

      <div className="grid gap-3">
        <Link
          href="/signup"
          className="auth-button button button--lg button--full-width button--primary"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="auth-button button button--lg button--full-width button--outline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
