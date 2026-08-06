const BASE =
  typeof window !== "undefined"
    ? "/api/proxy"
    : (process.env.NEXT_PUBLIC_BACKEND_URL ?? "");

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${BASE}${path}`, { credentials: "include", ...init });

// CI 역검증용 의도적 타입 에러 (이 브랜치는 폐기)
const __ciNegativeCheck: number = "string";
