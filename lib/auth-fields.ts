export function emailError(value: string) {
  const email = value.trim();
  if (!email) return "Enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "That email does not look right.";
  }
  return undefined;
}

export function passwordError(value: string) {
  if (!value) return "Enter your password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return undefined;
}
