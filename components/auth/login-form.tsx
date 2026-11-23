"use client";

import { signInWithEmail, type AuthActionState } from "@/app/(auth)/actions";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { PasswordField } from "@/components/auth/password-field";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useActionState } from "react";

function ForgotPasswordLink() {
  return (
    <Link href="/forgot-password" className="text-sm font-medium text-foreground">
      Forgot password?
    </Link>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signInWithEmail,
    null,
  );

  return (
    <Form validationBehavior="aria" className="grid gap-5" action={formAction}>
      <TextField
        name="email"
        type="email"
        isRequired
        autoComplete="email"
        className="w-full"
      >
        <Label className="text-sm text-foreground">Email</Label>
        <Input className="auth-input w-full" placeholder="you@shop.com" />
      </TextField>

      <PasswordField
        autoComplete="current-password"
        labelAction={<ForgotPasswordLink />}
      />

      {state?.error ? (
        <p className="rounded-2xl border border-[color-mix(in_oklab,var(--danger)_25%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_8%,white)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--danger)_75%,black)]">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        className="auth-button"
        isDisabled={isPending}
      >
        {isPending ? "Signing in…" : "Log in"}
      </Button>

      <OrDivider />
      <GoogleButton />
    </Form>
  );
}
