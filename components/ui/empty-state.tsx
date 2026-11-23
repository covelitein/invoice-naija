import type { ReactNode } from "react";

export function EmptyState({
  illustration,
  title,
  body,
  actions,
  className = "",
}: {
  illustration: ReactNode;
  title: string;
  body: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`app-panel motion-rise overflow-hidden rounded-[1.35rem] border border-dashed border-border bg-surface px-5 py-8 text-center ${className}`}
    >
      <div className="mx-auto w-full max-w-[20rem]">{illustration}</div>
      <h2 className="mt-5 text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {actions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
