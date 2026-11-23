"use client";

import {
  hasCompletedTour,
  markTourComplete,
  resetTourProgress,
  tourSteps,
  type TourStep,
} from "@/lib/tour";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Rect = { top: number; left: number; width: number; height: number };

type TourContextValue = {
  startTour: () => void;
  isOpen: boolean;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useProductTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useProductTour must be used within ProductTourProvider");
  }
  return ctx;
}

function measureTarget(selector: string): Rect | null {
  const candidates = selector
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of candidates) {
    const el = document.querySelector(part);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    el.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });
    const next = el.getBoundingClientRect();
    const pad = 10;
    return {
      top: Math.max(8, next.top - pad),
      left: Math.max(8, next.left - pad),
      width: Math.min(window.innerWidth - 16, next.width + pad * 2),
      height: Math.min(window.innerHeight - 16, next.height + pad * 2),
    };
  }
  return null;
}

function tooltipStyle(rect: Rect, placement: TourStep["placement"]) {
  const gap = 14;
  const tipWidth = Math.min(340, window.innerWidth - 24);
  let top = rect.top + rect.height + gap;
  let left = rect.left;

  if (placement === "top") {
    top = rect.top - gap - 160;
  } else if (placement === "right") {
    top = rect.top;
    left = rect.left + rect.width + gap;
  } else if (placement === "left") {
    top = rect.top;
    left = rect.left - tipWidth - gap;
  }

  left = Math.min(Math.max(12, left), window.innerWidth - tipWidth - 12);
  top = Math.min(Math.max(12, top), window.innerHeight - 200);

  return { top, left, width: tipWidth };
}

export function ProductTourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  const step = tourSteps[index];

  const refresh = useCallback(() => {
    if (!open || !step) return;
    const next = measureTarget(step.target);
    setRect(next);
  }, [open, step]);

  const startTour = useCallback(() => {
    resetTourProgress();
    setIndex(0);
    setOpen(true);
  }, []);

  const finish = useCallback(() => {
    markTourComplete();
    setOpen(false);
    setRect(null);
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (pathname !== "/home") return;
    if (hasCompletedTour()) return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [ready, pathname]);

  useEffect(() => {
    if (!open || !step) return;

    let cancelled = false;
    async function go() {
      if (step.href && pathname !== step.href) {
        router.push(step.href);
        await new Promise((resolve) => window.setTimeout(resolve, 380));
      }
      if (cancelled) return;
      // Retry a few times while the route paints.
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const next = measureTarget(step.target);
        if (next) {
          setRect(next);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 120));
        if (cancelled) return;
      }
      setRect(null);
    }

    void go();
    return () => {
      cancelled = true;
    };
  }, [open, step, pathname, router]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") {
        setIndex((value) => Math.min(tourSteps.length - 1, value + 1));
      }
      if (event.key === "ArrowLeft") {
        setIndex((value) => Math.max(0, value - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  const tip = useMemo(() => {
    if (!rect || !step) return null;
    return tooltipStyle(rect, step.placement || "auto");
  }, [rect, step]);

  const value = useMemo(
    () => ({ startTour, isOpen: open }),
    [startTour, open],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {open && step ? (
        <div className="tour-root" role="dialog" aria-modal="true" aria-label="Product tour">
          {/* Click catcher only — visuals come from the spotlight cutout so the target stays sharp. */}
          <button
            type="button"
            className="tour-scrim tour-scrim--clear"
            aria-label="Dismiss tour"
            onClick={finish}
          />
          {rect ? (
            <div
              className="tour-spotlight"
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
            />
          ) : (
            <div className="tour-scrim" aria-hidden style={{ pointerEvents: "none" }} />
          )}
          <div
            className="tour-card app-panel"
            style={
              tip
                ? {
                    top: tip.top,
                    left: tip.left,
                    width: tip.width,
                    zIndex: 2,
                  }
                : {
                    top: "50%",
                    left: "50%",
                    width: Math.min(340, typeof window !== "undefined" ? window.innerWidth - 24 : 340),
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium tracking-[0.12em] text-brand uppercase">
                Tour · {index + 1}/{tourSteps.length}
              </p>
              <button
                type="button"
                onClick={finish}
                className="text-xs font-medium text-muted hover:text-foreground"
              >
                Skip
              </button>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {step.title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted">{step.body}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium disabled:opacity-40"
              >
                Back
              </button>
              {index >= tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
                >
                  Finish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setIndex((value) =>
                      Math.min(tourSteps.length - 1, value + 1),
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </TourContext.Provider>
  );
}
