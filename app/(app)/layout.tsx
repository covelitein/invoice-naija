import { AppShell } from "@/components/app/app-shell";
import { ProductTourProvider } from "@/components/tour/product-tour";
import { HostingerToastProvider } from "@/components/ui/hostinger-toast";
import type { ReactNode } from "react";
import { Suspense } from "react";

function AppShellFallback() {
  return (
    <div className="app-canvas flex h-dvh items-center justify-center text-sm text-muted">
      Loading workspace…
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <HostingerToastProvider>
        <ProductTourProvider>
          <AppShell>{children}</AppShell>
        </ProductTourProvider>
      </HostingerToastProvider>
    </Suspense>
  );
}
