"use client";

import { emailError } from "@/lib/auth-fields";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";

export function ResetForm() {
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();

  if (sentTo) {
    return (
      <div className="grid gap-8">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-base leading-7 text-muted">
            Password reset email is not live yet — it ships with the backend.
            For now, continue in local demo mode from log in.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted">Requested for</p>
          <p className="mt-1 font-medium break-all">{sentTo}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="auth-button"
          onPress={() => {
            setSentTo(undefined);
            setError(undefined);
          }}
        >
          Use a different email
        </Button>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-foreground"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-base leading-7 text-muted">
          Enter the email on your account. Reset email delivery arrives with the
          backend; this screen is preview-only for now.
        </p>
      </div>
      <Form
        validationBehavior="aria"
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const email = String(data.get("email") ?? "");
          const nextError = emailError(email);
          setError(nextError);
          if (!nextError) setSentTo(email.trim());
        }}
      >
        <TextField
          name="email"
          type="email"
          isInvalid={Boolean(error)}
          autoComplete="email"
          onChange={() => setError(undefined)}
          className="w-full"
        >
          <Label className="text-sm text-foreground">Email</Label>
          <Input className="auth-input w-full" placeholder="you@shop.com" />
          <FieldError>{error}</FieldError>
        </TextField>
        <Button type="submit" variant="primary" fullWidth className="auth-button">
          Request reset (preview)
        </Button>
      </Form>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground">
          Log in
        </Link>
      </p>
    </div>
  );
}
