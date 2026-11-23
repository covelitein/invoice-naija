"use client";

import { Mark } from "@/components/auth/mark";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const DWELL_MS = 3400;
const SLIDE_MS = 520;

const slides = [
  {
    id: "details",
    kicker: "01 · DETAILS",
    title: "Add the details",
    caption: "Business, customer, and what you sold.",
  },
  {
    id: "invoice",
    kicker: "02 · INVOICE",
    title: "See the amount due",
    caption: "Clear totals ready to send.",
  },
  {
    id: "whatsapp",
    kicker: "03 · WHATSAPP",
    title: "Send in one tap",
    caption: "Text goes on WhatsApp; download the PDF to attach.",
  },
] as const;

export function Journey() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const startRef = useRef(0);
  const frameRef = useRef(0);

  const elapsedRef = useRef(0);

  const goTo = useCallback(
    (next: number, dir?: number) => {
      const wrapped = (next + slides.length) % slides.length;
      setDirection(
        dir ??
          (wrapped > index || (index === slides.length - 1 && wrapped === 0)
            ? 1
            : -1),
      );
      setIndex(wrapped);
      elapsedRef.current = 0;
      setProgress(0);
      startRef.current = performance.now();
    },
    [index],
  );

  const tick = useEffectEvent((now: number) => {
    if (paused || reducedMotion) return;
    const elapsed = now - startRef.current;
    elapsedRef.current = elapsed;
    setProgress(Math.min(1, elapsed / DWELL_MS));
    if (elapsed >= DWELL_MS) {
      goTo(index + 1, 1);
      return;
    }
    frameRef.current = requestAnimationFrame(tick);
  });

  useEffect(() => {
    if (paused || reducedMotion) {
      cancelAnimationFrame(frameRef.current);
      return;
    }
    startRef.current = performance.now() - elapsedRef.current;
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [index, paused, reducedMotion, tick]);

  return (
    <div
      className="journey flex h-full min-h-0 w-full max-w-[460px] flex-col justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="max-w-[26rem]">
        <p className="text-xs font-medium tracking-[0.16em] text-brand">
          HOW IT WORKS
        </p>
        <h2 className="mt-2 text-[1.85rem] leading-[1.15] font-semibold tracking-tight text-balance">
          Write it once. Send it on WhatsApp.
        </h2>
      </div>

      <div
        className="relative mt-8 overflow-hidden"
        style={{ minHeight: "22.5rem" }}
        aria-live="polite"
        aria-atomic="true"
      >
        <SlidePanel
          key={slides[index].id}
          direction={direction}
          reducedMotion={reducedMotion}
        >
          {index === 0 ? <DetailsCard /> : null}
          {index === 1 ? <InvoiceCard /> : null}
          {index === 2 ? <WhatsAppCard /> : null}
        </SlidePanel>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-tight">
            {slides[index].title}
          </p>
          <p className="mt-1 text-sm text-muted">{slides[index].caption}</p>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="Steps">
          {slides.map((slide, step) => {
            const active = step === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${slide.title}. Step ${step + 1} of ${slides.length}`}
                className={
                  active
                    ? "relative h-2.5 w-8 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--brand)_22%,white)]"
                    : "size-2.5 rounded-full bg-border transition-[width,background-color] duration-300"
                }
                onClick={() => goTo(step, step > index ? 1 : -1)}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-full bg-brand"
                    style={{
                      width: `${Math.max(12, progress * 100)}%`,
                      transition: reducedMotion ? "none" : "width 80ms linear",
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SlidePanel({
  children,
  direction,
  reducedMotion,
}: {
  children: ReactNode;
  direction: number;
  reducedMotion: boolean;
}) {
  return (
    <div
      className="journey-slide"
      style={
        {
          "--slide-from": `${direction * 28}px`,
          "--slide-duration": reducedMotion ? "1ms" : `${SLIDE_MS}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

function DetailsCard() {
  return (
    <article className="journey-card rounded-[1.5rem] border border-border bg-surface p-5 shadow-surface">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted">
        01 · DETAILS
      </p>
      <div className="mt-4 grid gap-3">
        <Field label="Your business" value="Your business" />
        <Field label="Customer" value="Chioma Adeyemi · 0803 441 2290" />
        <Field label="Item" value="Project milestone · ₦450,000" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <span className="size-1.5 rounded-full bg-brand" />
        Typing into the invoice
      </div>
    </article>
  );
}

function InvoiceCard() {
  return (
    <article className="journey-card relative overflow-hidden rounded-[1.5rem] border border-border bg-surface p-5 shadow-surface">
      <span
        aria-hidden
        className="absolute top-0 right-0 size-10 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <span
        aria-hidden
        className="absolute top-0 right-0 size-10 border-b border-l border-border"
        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
      />
      <div className="flex items-start justify-between gap-3 pr-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted">
            02 · INVOICE
          </p>
          <p className="mt-1.5 font-mono text-sm">INV-0012</p>
        </div>
        <Mark className="size-8" />
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
        <p>Discovery & design</p>
        <p className="tabular-nums">₦180,000.00</p>
        <p className="text-muted">Implementation</p>
        <p className="text-muted tabular-nums">₦70,000.00</p>
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-separator pt-3.5">
        <p className="text-sm text-muted">Amount due</p>
        <p className="text-lg font-semibold tabular-nums">₦250,000.00</p>
      </div>
    </article>
  );
}

function WhatsAppCard() {
  return (
    <article className="journey-card journey-card--send rounded-[1.5rem] border border-border bg-surface p-5 shadow-surface">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.12em] text-brand">
          03 · WHATSAPP
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--brand)_14%,white)] px-2.5 py-1 text-[11px] font-medium text-brand">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          Ready
        </span>
      </div>
      <p className="mt-4 rounded-2xl rounded-tl-md bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-4 py-3.5 text-sm leading-6">
        Hello Chioma, here is your invoice INV-0012. Balance due ₦30,000. I&apos;ll
        also send the PDF.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f4f4] px-3.5 py-2 text-xs">
          <PdfIcon />
          INV-0012.pdf
        </span>
        <span className="text-xs text-muted">download separately</span>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1.5 rounded-full bg-[#f4f4f4] px-3.5 py-2.5 text-sm">
        {value}
      </p>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 text-muted" aria-hidden>
      <path
        d="M4 1.5h5.2L12 4.3V14a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 14V1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M9 1.5V4h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}
