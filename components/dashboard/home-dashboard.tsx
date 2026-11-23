"use client";

import { PlusIcon } from "@/components/app/icons";
import { OverdueList } from "@/components/dashboard/overdue-list";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { StatCards } from "@/components/dashboard/stat-cards";
import { EmptyWorkspaceScene } from "@/components/illustrations/scenes";
import { useProductTour } from "@/components/tour/product-tour";
import { EmptyState } from "@/components/ui/empty-state";
import { apiGet } from "@/lib/api-client";
import {
  computeDashboardFromSaved,
  replaceSavedDocuments,
  type SavedDocument,
} from "@/lib/local-documents";
import {
  defaultSettings,
  profileFromSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";
import { clearWorkspaceData, loadWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HomeDashboard() {
  const { startTour } = useProductTour();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState({
    receivedThisMonthKobo: 0,
    unpaidKobo: 0,
    overdueCount: 0,
  });
  const [recent, setRecent] = useState<
    ReturnType<typeof loadWorkspace>["dashboard"]["recentDocuments"]
  >([]);
  const [overdue, setOverdue] = useState<
    ReturnType<typeof loadWorkspace>["dashboard"]["overdueDocuments"]
  >([]);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    (async () => {
      // Check if localStorage has leftover dummy/sample data from previous test sessions
      const local = loadWorkspace();
      const hasDummySample =
        Boolean(local.settings.samplePackId) ||
        local.settings.businessName === "Glow House Spa" ||
        local.settings.ownerName === "Zainab Yusuf";

      if (hasDummySample) {
        clearWorkspaceData();
      }

      // Fetch live data from backend
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
        replaceSavedDocuments(remoteDocs.documents);
        const dash = computeDashboardFromSaved(remoteDocs.documents);
        setStats(dash.stats);
        setRecent(dash.recentDocuments);
        setOverdue(dash.overdueDocuments);
        setDocCount(dash.documentsThisMonth);
      } else if (!hasDummySample) {
        setStats(local.dashboard.stats);
        setRecent(local.dashboard.recentDocuments);
        setOverdue(local.dashboard.overdueDocuments);
        setDocCount(local.dashboard.documentsThisMonth);
      } else {
        setStats({ receivedThisMonthKobo: 0, unpaidKobo: 0, overdueCount: 0 });
        setRecent([]);
        setOverdue([]);
        setDocCount(0);
      }

      setHydrated(true);
    })();
  }, []);

  const profile = profileFromSettings(settings);
  const firstName = profile.owner.split(" ")[0] || "there";
  const empty = hydrated
    ? recent.length === 0 && overdue.length === 0
    : false;

  return (
    <div className="motion-stagger grid gap-5 @[40rem]/main:gap-6 lg:gap-7">
      <header
        data-tour="home-hero"
        className="app-panel hero-shimmer relative overflow-hidden rounded-[1.6rem] border border-border px-4 py-5 sm:px-6 sm:py-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-8 size-40 rounded-full bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] blur-3xl"
        />

        <div className="relative flex flex-col gap-4 @[42rem]/main:flex-row @[42rem]/main:items-end @[42rem]/main:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--brand)_18%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_10%,white)] px-2.5 py-1 text-[11px] font-medium text-brand">
                {profile.name}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#eef1ee] px-2.5 py-1 text-[11px] font-medium text-muted">
                {profile.plan === "pro" ? "Pro" : "Free"} · {docCount}/
                {profile.plan === "pro" ? "∞" : profile.documentLimit} docs
                <span className="ml-1 text-[10px] opacity-70">
                  · Live account
                </span>
              </span>
            </div>
            <h1 className="mt-3 text-[1.65rem] leading-tight font-semibold tracking-tight @[42rem]/main:text-[1.85rem] sm:text-3xl">
              {empty
                ? "Let's create your first invoice"
                : `Welcome back, ${firstName}`}
            </h1>
            <p className="mt-1.5 max-w-2xl text-[0.95rem] text-muted sm:text-base">
              {empty
                ? "Add a customer, draft with Gemini, or create your first invoice."
                : "See who has paid, who still owes you, and send a reminder in one tap."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 @[42rem]/main:w-auto @[42rem]/main:flex-row">
            <button
              type="button"
              onClick={startTour}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white/90 px-5 text-sm font-medium backdrop-blur"
            >
              Take a tour
            </button>
            <Link
              href="/documents/new"
              data-tour="new-document"
              className="relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-[0_14px_28px_-16px_rgba(15,23,15,0.65)] transition-transform active:scale-[0.98]"
            >
              <PlusIcon className="size-4" />
              New document
            </Link>
          </div>
        </div>
      </header>

      <StatCards
        receivedKobo={stats.receivedThisMonthKobo}
        unpaidKobo={stats.unpaidKobo}
        overdueCount={stats.overdueCount}
      />

      {empty ? (
        <EmptyState
          illustration={
            <EmptyWorkspaceScene className="mx-auto h-auto w-full" />
          }
          title="Your workspace is clean and ready"
          body="Start by creating your first invoice or receipt for your real customers."
          actions={
            <>
              <Link
                href="/documents/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
              >
                Create document
              </Link>
              <Link
                href="/customers"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-medium"
              >
                Add customers
              </Link>
              <Link
                href="/settings"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--brand)_22%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_8%,white)] px-5 text-sm font-medium text-brand"
              >
                Set up business profile
              </Link>
            </>
          }
        />
      ) : (
        <div className="grid gap-5 @[56rem]/main:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] @[56rem]/main:gap-7">
          <OverdueList documents={overdue} />
          <RecentDocuments documents={recent} />
        </div>
      )}
    </div>
  );
}
