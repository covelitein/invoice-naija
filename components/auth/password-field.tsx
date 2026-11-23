"use client";

import { Description, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState, type ReactNode } from "react";

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.6A2 2 0 0 0 12 15a2 2 0 0 0 1.4-.6M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.8 4.2 10 7-.4.9-1.1 2-2.1 3.1M6.1 6.1C4.2 7.4 2.9 9.3 2 12c.7 1.6 2.2 3.6 4.3 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PasswordField({
  name = "password",
  label = "Password",
  error,
  hint,
  autoComplete,
  labelAction,
  onClear,
}: {
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  autoComplete: string;
  labelAction?: ReactNode;
  onClear?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      name={name}
      type={visible ? "text" : "password"}
      isInvalid={Boolean(error)}
      autoComplete={autoComplete}
      onChange={onClear}
      className="w-full"
    >
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm text-foreground">{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        <Input className="auth-input w-full pe-14" />
        <button
          type="button"
          className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
      {hint ? <Description>{hint}</Description> : null}
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
