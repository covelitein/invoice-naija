import { SettingsView } from "@/components/settings/settings-view";
import { defaultSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsView initial={defaultSettings} />;
}
