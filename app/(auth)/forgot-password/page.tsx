import { ResetForm } from "@/components/auth/reset-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return <ResetForm />;
}
