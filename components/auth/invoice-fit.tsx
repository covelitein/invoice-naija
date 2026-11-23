"use client";

import type { ReactNode } from "react";

export function InvoiceFit({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 items-center overflow-hidden">
      <div className="w-full">{children}</div>
    </div>
  );
}
