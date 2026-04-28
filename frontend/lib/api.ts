const BASE =
  typeof window !== "undefined"
    ? "/api/proxy"
    : (process.env.NEXT_PUBLIC_BACKEND_URL ?? "");

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${BASE}${path}`, { credentials: "include", ...init });
