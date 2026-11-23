import { HomeDashboard } from "@/components/dashboard/home-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return <HomeDashboard />;
}
