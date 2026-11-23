"use client";

import { Button } from "@heroui/react";
import { useState } from "react";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.9 10.7A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.2.3-1.7V5H.9A9 9 0 0 0 0 9c0 1.4.3 2.8.9 4l3-2.3Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15.1 2A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"
      />
    </svg>
  );
}

export function GoogleButton() {
  const [notice, setNotice] = useState(false);

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        fullWidth
        className="auth-button"
        onPress={() => setNotice(true)}
      >
        <GoogleMark />
        Continue with Google
      </Button>
      {notice ? (
        <p className="text-center text-xs text-muted">
          Google sign-in ships with the backend. Use email to continue in local
          demo mode.
        </p>
      ) : null}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <span className="h-px bg-separator" />
      <span className="text-xs text-muted">or</span>
      <span className="h-px bg-separator" />
    </div>
  );
}
