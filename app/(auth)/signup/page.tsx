import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-base leading-7 text-muted">
          You will add your business name next. The first invoice can go out
          today.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground">
          Log in
        </Link>
      </p>
    </div>
  );
}
