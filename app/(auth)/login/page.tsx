import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-base leading-7 text-muted">
          Log in to see who has paid and who still owes you.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-foreground">
          Create an account
        </Link>
      </p>
    </div>
  );
}
