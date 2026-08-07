import type { ReactNode } from "react";
import { BackToTour } from "@/components/shared/BackToTour";

/**
 * 키오스크 화면을 "입구 거치용 태블릿" 목업 안에 넣어 보여주는 래퍼.
 *
 * 이 화면들은 실제로는 입구에 거치된 가로형 태블릿에서 전체화면으로 돌아간다.
 * 포트폴리오를 데스크톱 브라우저로 열면 그 맥락이 전혀 드러나지 않으므로,
 * 마우스를 쓰는 넓은 화면에서만 베젤과 기기 배지를 씌워 용도를 드러낸다.
 *
 * 조건을 폭(`xl`)만으로 잡지 않고 `pointer-fine`을 함께 보는 이유:
 * iPad Pro 가로가 1366px라 폭만으로는 데스크톱과 구분되지 않는다. 실제 태블릿은
 * coarse 포인터라 베젤 없이 지금까지와 동일한 전체화면으로 뜬다 — 진짜 기기에서
 * "태블릿 안의 태블릿"이 되는 걸 막는 게 이 조건의 목적이다.
 *
 * DOM을 두 벌 렌더하지 않는 것도 의도적이다 — 키패드 입력 상태가 갈라진다.
 * 프레임 요소는 기본이 `contents`/`hidden`이고, 조건이 맞을 때만 실제 상자가 된다.
 *
 * 감싸는 화면은 루트에 `xl:pointer-fine:min-h-full`을 달아야 한다.
 * `min-h-screen`이 그대로 남으면 프레임 안에서 100vh를 차지해 세로 스크롤이 생긴다.
 */
export function TabletFrame({ children }: { children: ReactNode }) {
  return (
    <div className="xl:pointer-fine:relative xl:pointer-fine:flex xl:pointer-fine:min-h-screen xl:pointer-fine:flex-col xl:pointer-fine:items-center xl:pointer-fine:justify-center xl:pointer-fine:gap-4 xl:pointer-fine:bg-gray-950 xl:pointer-fine:p-6">
      {/* 데모용 크롬 — 프레임 바깥에 둬야 기기 화면의 일부로 오해되지 않는다.
          display는 래퍼에 건다 — BackToTour가 자체 `inline-flex`를 갖고 있어
          className으로 넘긴 `hidden`은 Tailwind 유틸 정렬 순서에서 밀린다. */}
      <div className="absolute top-6 left-6 hidden xl:pointer-fine:block">
        <BackToTour />
      </div>

      {/* 베젤 — 높이를 먼저 정하고 16:10으로 폭을 유도한다.
          폭을 먼저 잡으면 세로가 짧은 노트북에서 프레임이 화면 밖으로 밀린다. */}
      <div className="contents xl:pointer-fine:block xl:pointer-fine:relative xl:pointer-fine:h-[min(720px,calc(100svh-8rem))] xl:pointer-fine:aspect-[16/10] xl:pointer-fine:w-auto xl:pointer-fine:max-w-full xl:pointer-fine:rounded-[2rem] xl:pointer-fine:border-2 xl:pointer-fine:border-white/15 xl:pointer-fine:bg-gray-700 xl:pointer-fine:p-4 xl:pointer-fine:shadow-2xl xl:pointer-fine:shadow-black/70">
        {/* 전면 카메라 — 가로 거치라 짧은 변(왼쪽)에 온다 */}
        <div className="absolute top-1/2 left-1.5 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-500 ring-1 ring-black/40 xl:pointer-fine:block" />

        <div className="contents xl:pointer-fine:block xl:pointer-fine:h-full xl:pointer-fine:w-full xl:pointer-fine:overflow-y-auto xl:pointer-fine:rounded-2xl">
          {children}
        </div>
      </div>

      {/* 랜딩 디바이스 섹션과 같은 배지 — 이미 본 라벨을 재사용해야 기기가 빨리 읽힌다 */}
      <span className="hidden rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-bold whitespace-nowrap text-orange-400 xl:pointer-fine:inline-block">
        입구 거치용 태블릿 · 가로 모드
      </span>
    </div>
  );
}
