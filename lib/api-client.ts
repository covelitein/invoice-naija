/** Browser helpers that communicate with the Invoice Naija Backend API (Render / Express / MySQL). */

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "")
    : (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "");

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))) {
    return `${API_BASE.replace(/\/$/, "")}${cleanPath}`;
  }
  return cleanPath;
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const url = resolveUrl(path);
    const response = await fetch(url, { credentials: "include" });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const url = resolveUrl(path);
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        ok: false,
        status: response.status,
        message: payload?.error || `Request failed (${response.status})`,
      };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}
