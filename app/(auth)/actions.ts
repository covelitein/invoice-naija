"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export type AuthActionState = { error: string } | null;

export async function signUpWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Owner";

  if (!email) return { error: "Email is required." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { error } = await auth.signUp.email({
    email,
    password,
    name,
  });

  if (error) {
    return { error: error.message || "Could not create account." };
  }

  redirect("/home");
}

export async function signInWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message || "Could not sign in. Try again." };
  }

  redirect("/home");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/login");
}
