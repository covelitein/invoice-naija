"use client";

import { signUpWithEmail, type AuthActionState } from "@/app/(auth)/actions";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { PasswordField } from "@/components/auth/password-field";
import { AppSelect } from "@/components/ui/app-select";
import { INDUSTRY_OPTIONS, type Industry } from "@/lib/settings";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import { useActionState, useState } from "react";

export function SignupForm() {
  const [industry, setIndustry] = useState<Industry>("general");
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signUpWithEmail,
    null,
  );

  return (
    <Form validationBehavior="aria" className="grid gap-5" action={formAction}>
      <TextField
        name="name"
        type="text"
        isRequired
        autoComplete="name"
        className="w-full"
      >
        <Label className="text-sm text-foreground">Your name</Label>
        <Input className="auth-input w-full" placeholder="Ada Okonkwo" />
      </TextField>

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

      <input type="hidden" name="industry" value={industry} />
      <AppSelect
        label="What kind of work do you do?"
        value={industry}
        options={INDUSTRY_OPTIONS}
        onChange={(value) => setIndustry(value as Industry)}
      />

      <PasswordField
        autoComplete="new-password"
        hint="At least 8 characters."
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
        {isPending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-xs text-muted">
        Accounts are stored securely with Neon Auth. Google sign-in uses Neon’s
        shared OAuth when enabled.
      </p>

      <OrDivider />
      <GoogleButton />
    </Form>
  );
}
