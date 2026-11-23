"use client";

import { Wordmark } from "@/components/auth/mark";
import {
  CloseIcon,
  CustomersIcon,
  DocumentsIcon,
  HelpIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
} from "@/components/app/icons";
import { useProductTour } from "@/components/tour/product-tour";
import { apiGet } from "@/lib/api-client";
import { listSavedDocuments, type SavedDocument } from "@/lib/local-documents";
import {
  defaultSettings,
  loadSettings,
  profileFromSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";
import { clearWorkspaceData, loadWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon, tourId: "nav-home" },
  {
    href: "/documents",
    label: "Documents",
    icon: DocumentsIcon,
    tourId: "nav-documents",
  },
  {
    href: "/customers",
    label: "Customers",
    icon: CustomersIcon,
    tourId: "nav-customers",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: SettingsIcon,
    tourId: "nav-settings",
  },
];

export function Sidebar({
  onNavigate,
  onClose,
  mobile = false,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const { startTour } = useProductTour();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    (async () => {
      const local = loadWorkspace();
      const hasDummySample =
        Boolean(local.settings.samplePackId) ||
        local.settings.businessName === "Glow House Spa" ||
        local.settings.ownerName === "Zainab Yusuf";

      if (hasDummySample) {
        clearWorkspaceData();
      }

      const [remoteSettings, remoteDocs] = await Promise.all([
        apiGet<{ settings: AppSettings }>("/api/settings"),
        apiGet<{ documents: SavedDocument[] }>("/api/documents"),
      ]);

      if (remoteSettings?.settings) {
        setSettings(remoteSettings.settings);
        saveSettings(remoteSettings.settings);
      } else if (!hasDummySample) {
        setSettings(local.settings);
      } else {
        setSettings(defaultSettings);
      }

      if (remoteDocs?.documents) {
        setDocCount(remoteDocs.documents.length);
      } else if (!hasDummySample) {
        setDocCount(listSavedDocuments().length);
      } else {
        setDocCount(0);
      }
    })();
  }, [pathname]);

  const profile = profileFromSettings(settings);
  const initials = profile.owner
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      id={mobile ? "mobile-nav" : undefined}
      className={
        mobile
          ? "app-drawer-panel flex h-full w-[min(20.5rem,88vw)] shrink-0 flex-col overflow-hidden px-4 py-5"
          : "flex h-full w-[248px] shrink-0 flex-col overflow-hidden border-r border-separator bg-surface/90 px-4 py-5 backdrop-blur-md"
      }
    >
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3 px-1">
          <Wordmark href="/home" />
          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--brand)_16%,var(--border))] bg-white/80 text-muted shadow-[0_1px_0_color-mix(in_oklab,white_70%,transparent)_inset] transition-colors hover:bg-white hover:text-foreground"
              aria-label="Close menu"
            >
              <CloseIcon className="size-[17px]" />
            </button>
          ) : null}
        </div>

        {mobile ? (
          <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--brand)_14%,var(--border))] bg-[linear-gradient(160deg,color-mix(in_oklab,var(--brand)_10%,white),white)] px-3.5 py-3">
            <p className="text-xs font-semibold text-brand">{profile.name}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {docCount} docs created
            </p>
          </div>
        ) : null}

        <div className="mt-4">
          <Link
            href="/documents"
            onClick={onNavigate}
            className="flex h-10 w-full items-center gap-2.5 rounded-2xl border border-border bg-white px-3 text-xs text-muted shadow-[0_1px_2px_rgba(15,23,15,0.04)] transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <SearchIcon className="size-4 shrink-0 opacity-60" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="rounded-md border border-border bg-[#f6f8f6] px-1.5 py-0.5 font-mono text-[10px] text-muted">
              ⌘K
            </kbd>
          </Link>
        </div>

        <div className="mt-3">
          <Link
            href="/documents/new"
            data-tour="sidebar-new-document"
            onClick={onNavigate}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 text-sm font-medium text-background shadow-[0_12px_24px_-14px_rgba(15,23,15,0.65)] transition-transform active:scale-[0.98]"
          >
            <PlusIcon className="size-4" />
            <span>New document</span>
          </Link>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 rounded-2xl bg-[color-mix(in_oklab,var(--brand)_14%,white)] px-3.5 py-2.5 text-sm font-semibold text-brand shadow-[0_1px_2px_color-mix(in_oklab,var(--brand)_12%,transparent)]"
                  : "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-[#f3f6f3] hover:text-foreground"
              }
            >
              <Icon className="size-[19px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-separator/60 pt-3">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            startTour();
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-[#f3f6f3] hover:text-foreground"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eef1ee]">
            <SparklesIcon className="size-[17px]" />
          </span>
          Take a quick tour
        </button>

        <Link
          href="/settings#feature-request"
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-[#f3f6f3] hover:text-foreground"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-brand">
            <PlusIcon className="size-[17px]" />
          </span>
          Request a feature
        </Link>
        <a
          href="https://wa.me/2348000000000"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-[#f3f6f3] hover:text-foreground"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eef1ee]">
            <HelpIcon className="size-[17px]" />
          </span>
          Help and support
        </a>

        <div className="mt-2 flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,#fff_0%,#f6f8f6_100%)] px-3 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white shadow-[0_8px_18px_-10px_var(--brand)]">
            {initials || "IN"}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{profile.owner}</p>
            <p className="truncate text-xs text-muted" title={profile.email}>
              {profile.email || "Add email in Settings"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
