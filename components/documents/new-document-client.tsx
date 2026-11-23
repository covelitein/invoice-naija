"use client";

import { DocumentBuilder } from "@/components/documents/document-builder";
import type { Customer } from "@/lib/customers";
import { listLocalCustomers } from "@/lib/local-customers";
import {
  bankLineFromSettings,
  defaultSettings,
  loadSettings,
  type AppSettings,
} from "@/lib/settings";
import { useEffect, useState } from "react";

export function NewDocumentClient() {
  const [ready, setReady] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setSettings(loadSettings());
    setCustomers(listLocalCustomers());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="app-panel rounded-[1.35rem] border border-border bg-surface px-5 py-10 text-sm text-muted">
        Loading builder…
      </div>
    );
  }

  return (
    <DocumentBuilder
      customers={customers}
      geminiEnabled={settings.geminiEnabled}
      defaultTaxPercent={settings.defaultTaxPercent}
      bankLine={bankLineFromSettings(settings)}
      industry={settings.industry}
    />
  );
}
