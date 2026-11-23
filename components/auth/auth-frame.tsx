import { InvoiceFit } from "@/components/auth/invoice-fit";
import { Journey } from "@/components/auth/journey";
import { Wordmark } from "@/components/auth/mark";
import type { ReactNode } from "react";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-surface lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
      <aside className="hidden h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden border-r border-separator bg-background px-12 py-10 xl:px-16 lg:grid">
        <div className="justify-self-start">
          <Wordmark />
        </div>
        <InvoiceFit>
          <Journey />
        </InvoiceFit>
      </aside>

      <main className="h-full min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex min-h-full flex-col px-6 py-8 sm:px-10 lg:justify-center lg:px-16 lg:py-10">
          <div className="my-auto w-full max-w-[400px] self-center">
            <div className="mb-8 lg:hidden">
              <Wordmark />
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
