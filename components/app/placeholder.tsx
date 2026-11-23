import Link from "next/link";

export function Placeholder({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-surface px-6 py-16 text-center shadow-surface">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
