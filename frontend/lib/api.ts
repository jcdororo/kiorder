const BASE =
  typeof window !== "undefined"
    ? "/api/proxy"
    : (process.env.NEXT_PUBLIC_BACKEND_URL ?? "");

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${BASE}${path}`, { credentials: "include", ...init });

// NestJS ValidationPipe는 중첩 배열(@ValidateNested + items)의 위반 메시지 앞에
// 페이로드 경로를 붙인다: "items.0.한 메뉴는 최대 99개까지 주문할 수 있습니다."
// 손님/직원 화면에 내부 필드 경로가 보이면 안 되므로 벗겨낸다.
// - `단어.숫자.`가 반복되는 형태만 지운다(`items.0.`, `items.0.options.1.`).
//   숫자 인덱스를 요구하므로 한국어 문장이나 일반 문장은 절대 매칭되지 않고,
//   서버가 BadRequestException(문자열)로 던지는 품절 메시지도 그대로 통과한다.
const stripFieldPath = (message: string) =>
  message.replace(/^(?:[A-Za-z_$][A-Za-z0-9_$]*\.\d+\.)+/, "").trim();

/**
 * 실패 응답 본문에서 사용자에게 보여줄 문장을 꺼낸다.
 * 파싱이 새 예외를 만들면 원래 실패 이유가 가려지므로 통째로 감싸고,
 * 쓸 만한 문장이 없으면 호출부가 준 폴백 문구로 떨어진다.
 */
export async function readErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await res.json();
    const message = (body as { message?: unknown } | null)?.message;
    if (typeof message === "string") {
      const cleaned = stripFieldPath(message);
      if (cleaned) return cleaned;
    }
    if (Array.isArray(message)) {
      // 접두사를 벗기면 빈 문자열이 되는 항목은 건너뛰고 다음 후보를 본다.
      // toast는 개행을 렌더하지 않아 여러 줄을 합치면 뭉개지므로 첫 항목만 쓴다.
      for (const item of message) {
        if (typeof item !== "string") continue;
        const cleaned = stripFieldPath(item);
        if (cleaned) return cleaned;
      }
    }
  } catch {
    // 본문이 비었거나 JSON이 아님(502 HTML 등) — 폴백으로 넘어간다
  }
  return fallback;
}
