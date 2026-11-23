"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a HostingerToastProvider");
  }
  return context.toast;
}

export function HostingerToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    [],
  );

  const toast = {
    success: (title: string, message?: string, duration?: number) =>
      addToast("success", title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addToast("error", title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addToast("info", title, message, duration),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Hostinger-style floating toast viewport */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 right-5 z-[9999] flex w-full max-w-sm flex-col gap-2.5 sm:max-w-[24rem]"
      >
        {toasts.map((item) => (
          <HostingerToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function HostingerToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const duration = item.duration || 3800;

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto relative overflow-hidden rounded-2xl border border-[#3b236e]/80 bg-[#170f2c]/95 p-4 text-white shadow-[0_18px_40px_-10px_rgba(15,8,30,0.8),0_0_24px_rgba(103,61,230,0.2)] backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-4 duration-300"
      style={{
        boxShadow:
          item.type === "success"
            ? "0 18px 40px -10px rgba(0, 176, 116, 0.25), 0 0 20px rgba(103, 61, 230, 0.2)"
            : item.type === "error"
              ? "0 18px 40px -10px rgba(239, 68, 68, 0.25)"
              : "0 18px 40px -10px rgba(103, 61, 230, 0.35)",
      }}
    >
      <div className="flex items-start gap-3.5">
        {/* Hostinger Icon Badge */}
        <div className="mt-0.5 shrink-0">
          {item.type === "success" && (
            <div className="flex size-7 items-center justify-center rounded-full bg-[#00b074]/20 text-[#00b074] ring-1 ring-[#00b074]/50 shadow-[0_0_12px_rgba(0,176,116,0.3)]">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {item.type === "error" && (
            <div className="flex size-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          {item.type === "info" && (
            <div className="flex size-7 items-center justify-center rounded-full bg-[#673de6]/25 text-[#a78bfa] ring-1 ring-[#673de6]/50 shadow-[0_0_12px_rgba(103,61,230,0.4)]">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-white">{item.title}</p>
          {item.message ? (
            <p className="mt-1 text-xs leading-relaxed text-[#c4b5fd]/90">{item.message}</p>
          ) : null}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Hostinger Countdown Bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#673de6] via-[#8352ff] to-[#00b074] transition-all"
          style={{
            animation: `hostingerToastCountdown ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes hostingerToastCountdown {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
