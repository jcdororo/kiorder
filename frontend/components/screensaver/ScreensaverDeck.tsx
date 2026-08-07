"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useScreensaverContent } from "@/hooks/useScreensaverContent";
import { prefersReducedMotion } from "@/lib/motion";
import type { MenuItem } from "@/types/menu";

type Slide = { kind: "brand" } | { kind: "menu"; item: MenuItem };

/**
 * 시계만 따로 뗀 이유는 리렌더 범위다. 1초마다 갱신되는데 같은 컴포넌트에
 * 이미지 슬라이드 5장이 들어 있으면 그것들까지 매초 리렌더 대상이 된다.
 *
 * 이 컴포넌트는 유휴 상태에서만 마운트되므로 서버에서 렌더되지 않는다
 * → new Date()를 초기값으로 써도 하이드레이션 미스매치가 없다.
 * (홀 화면 시계가 null로 시작해야 했던 건 그쪽이 SSR을 타기 때문이다)
 */
function ScreensaverClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <span className="text-6xl font-bold tabular-nums text-white sm:text-7xl">
      {now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </span>
  );
}

function BrandIntro({ storeName }: { storeName: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-linear-to-b from-[#030712] to-[#111827] px-10 text-center">
      {/* 매장명은 쿼리가 도착하기 전 빈 문자열이다. 자리를 비워두면 시계가
          위로 튀므로 로딩 중에는 이 줄을 렌더하지 않고 gap으로 흡수한다. */}
      {storeName && (
        <p className="text-3xl font-bold text-white sm:text-4xl">{storeName}</p>
      )}
      <ScreensaverClock />
      <p className="text-base text-[#9ca3af] sm:text-lg">
        화면을 터치하면 계속 이용하실 수 있습니다
      </p>
    </div>
  );
}

function MenuSlide({ item }: { item: MenuItem }) {
  return (
    // 원격 이미지라 blurDataURL을 만들 수 없다. 로딩 중 흰 판이 뜨지 않도록
    // 컨테이너에 카드 배경색을 깔아둔다.
    <div className="relative h-full w-full overflow-hidden bg-[#1f2937]">
      <Image
        src={item.image}
        alt=""
        fill
        /* 메뉴 카드·FlyingThumb는 서로 sizes를 맞춰 /_next/image URL과 캐시를 공유한다.
           그 규칙이 성립하는 건 둘이 동시에, 인접한 크기로 나타나기 때문이다.
           여기서는 일부러 어긋낸다 — 카드용 저해상도(약 40vw)를 전체화면으로 늘리면
           뭉개진다. 캐시 재사용을 포기하는 대신, 이 요청은 아무것도 경쟁하지 않는
           유휴 시간에 일어난다. */
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="animate-screensaver-kenburns object-cover"
      />
      {/* 사진 위 글자의 가독을 배경색이 아니라 그라디언트로 확보한다 —
          사진마다 밝기가 달라 단색 박스로는 어떤 사진에선 뜨고 어떤 사진에선 묻힌다 */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#030712] via-[#030712]/80 to-transparent px-10 pt-32 pb-16">
        <p className="text-sm font-bold tracking-wide text-orange-400">
          오늘의 추천
        </p>
        <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          {item.name}
        </p>
        <p className="mt-1 text-2xl text-[#fb923c]">
          {item.price.toLocaleString()}원
        </p>
      </div>
    </div>
  );
}

/**
 * 화면보호기 슬라이드 순환.
 *
 * 이 컴포넌트는 유휴일 때만 마운트된다. 그래서 인덱스 리셋을 위한 state 동기화가
 * 필요 없다 — 유휴에 다시 들어갈 때마다 새로 마운트되어 useState(0)이 저절로
 * 브랜드 인트로부터 시작한다. (effect에서 setIndex(0)을 하면 CI 린트에 걸린다)
 */
export function ScreensaverDeck({ slideMs = 6000 }: { slideMs?: number }) {
  const { storeName, showcase } = useScreensaverContent();
  const [index, setIndex] = useState(0);

  // 마운트 시점에 한 번만 판정한다. 덱이 유휴마다 새로 마운트되므로
  // OS 설정을 도중에 바꿔도 다음 유휴 세션에는 반영된다.
  const [reduced] = useState(prefersReducedMotion);

  const slides = useMemo<Slide[]>(() => {
    const brand: Slide = { kind: "brand" };
    // WCAG 2.2.2 — 5초 넘게 자동으로 갱신되는 콘텐츠에는 중지 수단이 필요하다.
    // 모션 최소화 설정에서는 순환 자체를 없애 정적 한 장으로 만든다.
    if (reduced) return [brand];
    return [brand, ...showcase.map((item) => ({ kind: "menu" as const, item }))];
  }, [reduced, showcase]);

  useEffect(() => {
    if (slides.length <= 1) return; // 메뉴가 없으면 브랜드 한 장뿐 — 타이머가 필요 없다
    const tick = setInterval(() => setIndex((i) => i + 1), slideMs);
    return () => clearInterval(tick);
  }, [slides.length, slideMs]);

  // 메뉴 쿼리가 늦게 도착해 길이가 늘어나도 안전하도록 렌더에서 모듈로를 건다.
  // 인덱스를 effect로 되돌리지 않으므로 state 동기화가 없다.
  const active = index % slides.length;

  return (
    // 6초마다 바뀌는 장식 콘텐츠를 낭독하면 소음이다.
    // 이 화면의 접근 가능한 이름은 Screensaver 루트의 aria-label이 담당한다.
    <div aria-hidden className="absolute inset-0">
      {slides.map((slide, i) => (
        <div
          key={i}
          /* 조건부 렌더가 아니라 전부 마운트한 뒤 opacity만 토글한다.
             ① 진짜 크로스페이드가 되고
             ② next/image가 재마운트되지 않아 두 바퀴째 깜빡임·재요청이 없고
             ③ 전부 absolute inset-0이라 레이아웃 시프트가 구조적으로 불가능하다.

             700ms는 DESIGN.md의 200~300ms fade보다 길다. 그 토큰은 조작에 대한
             피드백용이고, 화면보호기 전환은 조작이 아니라 배경이라 느긋한 쪽이 맞다. */
          className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0"
          } ${
            /* Ken Burns를 활성 슬라이드에서만 재생시킨다. 클래스를 붙였다 떼면
               전환 도중 아직 보이는 이전 슬라이드가 scale(1)로 튄다. */
            i === active
              ? "[&_img]:[animation-play-state:running]"
              : "[&_img]:[animation-play-state:paused]"
          }`}
        >
          {slide.kind === "brand" ? (
            <BrandIntro storeName={storeName} />
          ) : (
            <MenuSlide item={slide.item} />
          )}
        </div>
      ))}
    </div>
  );
}
