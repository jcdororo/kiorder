"use client";

import { useEffect, useRef } from "react";
import { useIdle } from "@/hooks/useIdle";
import { ScreensaverDeck } from "./ScreensaverDeck";

type ScreensaverProps = {
  /** 유휴 판정까지의 시간. 키오스크 60초 / 테이블오더 180초 */
  idleMs: number;
  /** false면 유휴 판정을 멈춘다 (전송 중, 완료 모달 표시 중 등) */
  enabled?: boolean;
  /**
   * 화면보호기 위에 상시 노출할 안내 문구.
   * ReactNode가 아니라 string인 이유는 aria-label에 그대로 이어붙이기 때문이다 —
   * 눈으로 보는 안심 문구를 스크린리더 사용자도 똑같이 듣는다.
   */
  footerNote?: string;
  /** 슬라이드 한 장의 노출 시간 */
  slideMs?: number;
  /** 유휴가 풀릴 때 1회 호출. 키오스크는 여기서 폼을 지운다 */
  onWake?: () => void;
  /** 포지셔닝 슬롯. 테이블오더는 "fixed z-[60]", 키오스크는 "absolute z-40 rounded-2xl" */
  className?: string;
};

/**
 * 유휴 시간에 화면을 덮는 광고 슬라이드.
 *
 * useIdle을 안에 감춰서 페이지는 <Screensaver idleMs={60_000} /> 한 줄만 쓰고
 * 유휴 state를 알 필요가 없게 한다 — 훅은 통신·파생값, 페이지는 UI 오케스트레이션.
 *
 * 오버레이일 뿐 페이지를 언마운트하지 않으므로 테이블오더의 장바구니·카테고리·
 * 스크롤 위치가 그대로 보존된다. 라우팅이나 조건부 렌더로 구현하면 전부 날아간다.
 */
export function Screensaver({
  idleMs,
  enabled = true,
  footerNote,
  slideMs,
  onWake,
  className = "",
}: ScreensaverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isIdle, isExiting, wake } = useIdle({ idleMs, enabled, onWake });

  useEffect(() => {
    // 뒤에 가려진 버튼에 포커스 링이 남는 것을 막는다.
    // setState가 아니라 DOM 부수효과라 set-state-in-effect 대상이 아니다.
    if (isIdle) rootRef.current?.focus();
  }, [isIdle]);

  if (!isIdle) return null;

  const label = [
    "화면보호기입니다.",
    footerNote ? `${footerNote}.` : null,
    "화면을 누르거나 아무 키나 눌러 원래 화면으로 돌아갑니다.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      /* 해제 탭이 아래 UI로 새어나가는 걸 막는 3중 방어 중 둘.
         (주 방어는 useIdle의 200ms 퇴장 유예 창이다 — 그동안 오버레이가
          pointer-events를 켠 채 남아 pointerup/click을 흡수한다)
         preventDefault는 터치에서 합성 마우스 이벤트가 생기는 것과
         드래그 시 텍스트 선택을 함께 막는다. */
      onPointerDown={(e) => e.preventDefault()}
      onPointerUp={wake}
      onKeyDown={wake}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      /* 스크림이 아니라 불투명 canvas 색이다 — 아래를 가리는 게 목적이고,
         불투명하면 브라우저가 뒤를 그리지 않아도 된다.
         진입은 tw-animate-css(전환은 시작 스타일이 없어 마운트 시 발화하지 않는다),
         퇴장은 transition으로 처리한다. */
      className={`${className} inset-0 cursor-pointer overflow-hidden bg-[#030712] transition-opacity duration-200 select-none motion-reduce:transition-none ${
        isExiting
          ? "opacity-0"
          : "opacity-100 animate-in fade-in duration-500 motion-reduce:animate-none"
      }`}
    >
      <ScreensaverDeck slideMs={slideMs} />

      {footerNote && (
        /* 슬라이드가 아니라 셸에 둔다. 브랜드 인트로에만 넣으면 메뉴 슬라이드로
           넘어간 순간 안내가 사라져, 정작 안심시켜야 할 시간에 보이지 않는다. */
        <p className="pointer-events-none absolute inset-x-0 top-8 mx-auto w-fit rounded-full border border-orange-500/25 bg-[#030712]/70 px-4 py-1.5 text-sm font-bold text-orange-400 backdrop-blur-sm">
          {footerNote}
        </p>
      )}
    </div>
  );
}
