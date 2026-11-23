import { listLocalCustomers, replaceLocalCustomers } from "@/lib/local-customers";
import {
  computeDashboardFromSaved,
  listSavedDocuments,
  replaceSavedDocuments,
} from "@/lib/local-documents";
import {
  getSamplePack,
  settingsFromPack,
  type SamplePack,
} from "@/lib/sample-packs";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";
import { clearAppStorage } from "@/lib/storage";

export function loadWorkspace() {
  const settings = loadSettings();
  const customers = listLocalCustomers();
  const documents = listSavedDocuments();
  const dashboard = computeDashboardFromSaved(documents);
  return { settings, customers, documents, dashboard };
}

export function applySamplePack(pack: SamplePack) {
  const settings = settingsFromPack(pack);
  const settingsResult = saveSettings(settings);
  const customersResult = replaceLocalCustomers(pack.customers);
  const documentsResult = replaceSavedDocuments(pack.documents);
  return {
    settings,
    ok:
      settingsResult.ok && customersResult.ok && documentsResult.ok,
    message: !settingsResult.ok
      ? settingsResult.message
      : !customersResult.ok
        ? customersResult.message
        : !documentsResult.ok
          ? documentsResult.message
          : "Sample data loaded on this device.",
  };
}

export function applySamplePackById(id: string) {
  const pack = getSamplePack(id);
  if (!pack) {
    return { ok: false as const, message: "Unknown sample pack.", settings: loadSettings() };
  }
  return applySamplePack(pack);
}

export function clearWorkspaceData() {
  clearAppStorage();
  saveSettings(defaultSettings);
  return defaultSettings;
}
