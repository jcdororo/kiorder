"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Flight } from "@/hooks/useFlyToCart";

export default function FlyingThumb({
  flight,
  onDone,
}: {
  flight: Flight;
  onDone: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 호출부가 인라인 함수를 넘겨도 애니메이션이 재시작되지 않도록 최신 콜백을 ref에 담아둔다.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 시작/도착 좌표가 런타임 값이라 정적 Tailwind 클래스로는 표현할 수 없다 → Web Animations API
    const { from, to } = flight;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    // 직선 경로보다 위로 띄우는 양. 이동 거리에 비례시키되 짧은 이동에서도 곡선이 보이도록 최소값을 둔다.
    const rawLift = Math.max(60, Math.hypot(dx, dy) * 0.18);
    // 넓은 뷰포트에서는 거리가 멀어 lift가 커지는데, 그런 카드일수록 출발점도 높아
    // 정점이 화면 위로 잘렸다(1440에서 실측 -7px). 출발점이 가진 여유 안으로 클램프한다.
    // 정점에서 scale이 0.6이므로 시각적 반높이는 height * 0.6 / 2다.
    const apexHeadroom =
      from.top + from.height / 2 + dy * 0.5 - (from.height * 0.6) / 2 - 8;
    const lift = Math.min(rawLift, Math.max(0, apexHeadroom));

    const animation = el.animate(
      [
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
        {
          offset: 0.5,
          transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(0.6)`,
          opacity: 1,
        },
        // 키프레임 3개로는 opacity가 절반 지점부터 줄어 목적지 한참 전에 사라졌다.
        // 0.85까지 완전히 보이게 유지해 "장바구니로 들어가는" 순간을 실제로 보여준다.
        // 포물선 잔여 높이는 4t(1-t) 곡선을 따라 lift * 0.51.
        {
          offset: 0.85,
          transform: `translate(${dx * 0.85}px, ${dy * 0.85 - lift * 0.51}px) scale(0.35)`,
          opacity: 1,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      {
        duration: 400,
        easing: "cubic-bezier(.4, 0, .2, 1)",
        // 없으면 완료 직후 제거되기 전 한 프레임 동안 시작 위치로 튄다.
        fill: "forwards",
      },
    );

    let cancelled = false;
    animation.finished
      .then(() => {
        if (!cancelled) onDoneRef.current(flight.id);
      })
      // 언마운트로 cancel되면 finished가 reject된다. 사라진 컴포넌트가 부모 state를 건드리지 않도록 삼킨다.
      .catch(() => {});

    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [flight]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed pointer-events-none z-50 rounded-full overflow-hidden bg-[#374151]"
      style={{
        left: flight.from.left,
        top: flight.from.top,
        width: flight.from.width,
        height: flight.from.height,
        willChange: "transform, opacity",
      }}
    >
      {flight.image ? (
        <Image
          src={flight.image}
          alt=""
          fill
          // 메뉴 카드와 동일한 문자열이어야 next/image가 같은 w 후보를 골라
          // /_next/image URL이 일치하고 카드에서 이미 받아둔 이미지가 캐시로 재사용된다.
          sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 18vw"
          className="object-cover"
        />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center leading-none"
          style={{ fontSize: flight.from.width * 0.45 }}
        >
          🍽️
        </span>
      )}
    </div>
  );
}
