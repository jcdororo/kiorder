"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 유휴 시계를 되돌리는 이벤트 — "사람이 아직 앞에 있다"는 모든 신호 */
const RESET_EVENTS = [
  "pointerdown",
  // 데스크톱 데모의 마우스 이동 + 터치 드래그.
  // pointerdown/touchstart를 따로 등록하지 않는 이유도 이것 — 포인터 이벤트가 셋을 다 덮는다.
  "pointermove",
  "keydown",
  // 포인터가 움직이지 않는 휠·트랙패드 스크롤
  "wheel",
  // iOS 관성 스크롤은 pointermove 없이 scroll만 발생한다
  "scroll",
  // 탭이 숨겨져 있던 시간은 "손님이 화면 앞에 서 있던 시간"이 아니다
  "visibilitychange",
] as const;

/** 화면보호기를 실제로 걷어내는 이벤트 — RESET의 부분집합이다.
 *  pointermove가 빠진 게 핵심: 마우스가 1px 흔들렸다고 광고가 사라지면 안 된다.
 *  (터치 기기엔 hover가 없어 어차피 오지 않으므로 잃는 것도 없다) */
const WAKE_EVENTS = ["pointerdown", "keydown", "wheel"] as const;

const TICK_MS = 1000;

type Options = {
  /** 이 시간만큼 아무 신호가 없으면 유휴로 판정한다 */
  idleMs: number;
  /** false면 유휴 판정을 멈춘다 (전송 중, 모달 표시 중 등) */
  enabled?: boolean;
  /** 유휴 해제 후 오버레이를 유지할 시간. 유령 클릭 흡수 + 페이드아웃용 */
  exitMs?: number;
  /** 유휴 → 복귀 전환 시 1회 호출 */
  onWake?: () => void;
};

/**
 * 유휴 상태를 감지한다.
 *
 * 타이머를 이벤트마다 재설정하지 않고 `setInterval` 1초 폴링 + `Date.now()` 비교로 판정한다.
 * pointermove를 듣는 이상 핸들러는 O(1)이어야 하는데, 재설정 방식은 초당 60~120회
 * 타이머를 파기·생성하므로 throttle이 강제된다. 폴링이면 핸들러가 ref 쓰기 한 줄이다.
 * 벽시계 비교라 태블릿 절전·백그라운드 탭에서 드리프트 없이 자기보정되는 것도 이점이고,
 * 60초·180초 임계값에서 최대 ±1초 오차는 의미가 없다.
 */
export function useIdle({
  idleMs,
  enabled = true,
  exitMs = 200,
  onWake,
}: Options) {
  const [isIdle, setIsIdle] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // state와 짝을 이루는 ref. DOM 리스너 클로저가 최신 값을 즉시 읽어야 하는데
  // state는 다음 렌더까지 낡은 값이라 wake()가 두 번 실행될 수 있다.
  const isIdleRef = useRef(false);
  const isExitingRef = useRef(false);
  // 렌더 중에는 Date.now()를 부를 수 없으므로(react-hooks/purity) 0으로 두고
  // 아래 틱 effect가 마운트 시점에 실제 시각을 채운다.
  const lastActivityRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // prop을 리스너 클로저에 낡지 않게 전달하되 리스너는 재등록하지 않기 위한 미러.
  // deps에 enabled를 넣으면 mutation isPending이 토글될 때마다 리스너 9개가
  // detach/attach된다. (waiting/[waitingId]의 fetchRef, FlyingThumb의 onDoneRef와 같은 패턴)
  const enabledRef = useRef(enabled);
  const onWakeRef = useRef(onWake);
  useEffect(() => {
    enabledRef.current = enabled;
    onWakeRef.current = onWake;
  });

  const wake = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isIdleRef.current || isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);
    onWakeRef.current?.();
    // 즉시 언마운트하지 않는다. pointerdown에서 바로 걷어내면 뒤이은 pointerup/click이
    // 그 자리에 새로 드러난 요소(메뉴 카드 버튼)로 전달된다 — 화면보호기를 끄려던
    // 터치가 메뉴를 담아버린다. 이 유예 창이 그 이벤트들을 흡수하고,
    // 덤으로 페이드아웃 시간이 된다.
    exitTimerRef.current = setTimeout(() => {
      isIdleRef.current = false;
      isExitingRef.current = false;
      setIsIdle(false);
      setIsExiting(false);
    }, exitMs);
  }, [exitMs]);

  useEffect(() => {
    const onReset = () => {
      lastActivityRef.current = Date.now();
    };
    const onWakeEvent = () => wake();

    // capture가 필수다. scroll은 버블링하지 않으므로 테이블오더의
    // <main className="overflow-y-auto"> 내부 스크롤은 캡처 단계로만 document에 닿는다.
    // 이게 없으면 손님이 메뉴를 계속 스크롤하는 동안 화면보호기가 떠버린다.
    // 자식이 stopPropagation을 걸어도 캡처는 먼저 지나간다는 이점도 같이 얻는다.
    // 어떤 핸들러도 preventDefault를 부르지 않으므로 passive를 선언한다.
    const opts = { passive: true, capture: true } as const;

    RESET_EVENTS.forEach((e) => document.addEventListener(e, onReset, opts));
    WAKE_EVENTS.forEach((e) => document.addEventListener(e, onWakeEvent, opts));
    return () => {
      RESET_EVENTS.forEach((e) =>
        document.removeEventListener(e, onReset, opts),
      );
      WAKE_EVENTS.forEach((e) =>
        document.removeEventListener(e, onWakeEvent, opts),
      );
    };
  }, [wake]);

  useEffect(() => {
    // 유휴 시계의 기준점. idleMs가 바뀌어 이 effect가 다시 돌 때도 새로 잡는 게 맞다
    // — 임계값이 달라졌으면 그 시점부터 다시 세는 게 자연스럽다.
    lastActivityRef.current = Date.now();

    const tick = setInterval(() => {
      // 비활성 구간에서는 시계를 계속 앞으로 민다. 안 그러면 전송이 끝나
      // enabled가 true로 돌아온 순간, 그동안 쌓인 유휴 시간 때문에
      // 화면보호기가 곧바로 튀어나온다.
      if (!enabledRef.current) {
        lastActivityRef.current = Date.now();
        return;
      }
      if (isIdleRef.current) return;
      if (Date.now() - lastActivityRef.current < idleMs) return;
      isIdleRef.current = true;
      setIsIdle(true);
    }, TICK_MS);
    return () => clearInterval(tick);
  }, [idleMs]);

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    [],
  );

  // enabled가 유휴 도중 false로 바뀌면 페이드 없이 즉시 걷는다.
  // 렌더 중 파생값이라 effect 동기화가 필요 없다.
  return { isIdle: isIdle && enabled, isExiting, wake };
}
