import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * 각 역할 화면에서 랜딩의 "화면 둘러보기"(#screens) 섹션으로 돌아가는 버튼.
 *
 * 랜딩 최상단(`/`)이 아니라 `#screens`로 보내는 이유: 이 화면들은 전부 둘러보기
 * 섹션에서 진입하므로, 최상단으로 보내면 사용자가 다시 스크롤해서 목록을 찾아야 한다.
 *
 * `variant`로 표시 형태만 다르게 한다 — 링크 대상과 라벨은 항상 같게 유지해서
 * 화면마다 "홈으로"인지 "뒤로가기"인지 헷갈리지 않게 한다.
 */
const labelClass = {
  default: "text-sm",
  icon: "sr-only",
  // 폭에 따라 아이콘만 → 아이콘 + 라벨로 바뀌는 레일용.
  // 라벨을 지우는 게 아니라 sr-only로 숨기므로 좁은 폭에서도 이름은 읽힌다.
  responsive: "sr-only lg:not-sr-only lg:text-sm",
} as const;

export function BackToTour({
  variant = "default",
  className = "",
}: {
  /**
   * default: 아이콘 + 라벨 / icon: 좁은 헤더용 아이콘만(라벨은 스크린리더에만)
   * responsive: lg 미만에서 아이콘만, lg 이상에서 라벨까지 (아이콘 레일이 넓어지는 사이드바용)
   */
  variant?: keyof typeof labelClass;
  className?: string;
}) {
  return (
    <Link
      href="/#screens"
      aria-label="화면 둘러보기로 돌아가기"
      title="화면 둘러보기로 돌아가기"
      className={`inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5 shrink-0" />
      <span className={labelClass[variant]}>홈으로</span>
    </Link>
  );
}
