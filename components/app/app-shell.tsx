"use client";

import { MenuToggle } from "@/components/app/menu-toggle";
import { PlusIcon } from "@/components/app/icons";
import { Sidebar } from "@/components/app/sidebar";
import { Mark } from "@/components/auth/mark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="app-canvas flex h-dvh overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <div
        className={
          open
            ? "fixed inset-0 z-50 lg:hidden"
            : "pointer-events-none fixed inset-0 z-50 lg:hidden"
        }
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          className={
            open
              ? "app-drawer-scrim absolute inset-0 opacity-100 transition-opacity duration-300"
              : "app-drawer-scrim absolute inset-0 opacity-0 transition-opacity duration-300"
          }
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={
            open
              ? "app-drawer absolute inset-y-0 left-0 translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              : "app-drawer absolute inset-y-0 left-0 -translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          }
        >
          <span id={titleId} className="sr-only">
            Main navigation
          </span>
          <Sidebar
            mobile
            onClose={() => setOpen(false)}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-[color-mix(in_oklab,var(--brand)_18%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_8%,white)] px-3 py-2 text-center text-[11px] text-[color-mix(in_oklab,var(--brand)_70%,black)] sm:text-xs">
          Signed-in data syncs to your backend API & MySQL database.
        </div>
        <header className="app-mobile-header sticky top-0 z-20 flex items-center justify-between gap-3 px-3 py-2.5 lg:hidden">
          <MenuToggle
            open={open}
            controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          />

          <Link
            href="/home"
            className="inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight"
          >
            <Mark className="size-7" />
            <span className="truncate text-sm">InvoiceNaija</span>
          </Link>

          <Link
            href="/documents/new"
            data-tour="new-document"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-xs font-medium text-background shadow-[0_10px_20px_-12px_rgba(15,23,15,0.55)] transition-transform active:scale-[0.98]"
          >
            <PlusIcon className="size-3.5" />
            New
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="@container/main page-enter w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
