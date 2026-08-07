"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { MenuItem } from "@/types/menu";

/** 유휴 진입 시 동시에 붙는 이미지 수를 제한한다. 브랜드 인트로까지 총 6장 */
const MAX_SLIDES = 5;

/**
 * 화면보호기에 띄울 매장명과 쇼케이스 메뉴.
 *
 * 두 쿼리 모두 기존 키를 재사용하므로 테이블오더에서는 추가 요청이 발생하지 않는다
 * (["menu"]는 useTableMenu와, ["store","my"]는 홀·주방·POS·대시보드와 캐시를 공유한다).
 *
 * 키오스크처럼 이 훅이 처음 붙는 화면에서도 **마운트 시점에** 페치한다.
 * 유휴 진입 후에 지연 페치하면 안 된다 — 백엔드가 Render 무료 티어라 콜드스타트가
 * 30~60초라서, 첫 메뉴 슬라이드가 뜨는 6초 뒤까지 데이터가 도착하지 못한다.
 */
export function useScreensaverContent(limit = MAX_SLIDES) {
  const { data: store } = useQuery<{ id: string; name: string } | null>({
    queryKey: ["store", "my"],
    queryFn: async () => {
      // 빈 바디가 올 수 있어 res.json()을 바로 쓰지 않는다 (hall/orders와 동일)
      const res = await apiFetch("/stores/my");
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    staleTime: 10 * 60_000,
  });

  const { data: menus = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await apiFetch("/menu");
      if (!res.ok) throw new Error(`메뉴를 불러오지 못했습니다 (${res.status})`);
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const showcase = useMemo(
    () =>
      menus
        .filter(
          (m) =>
            // 품절 메뉴를 광고하지 않는다
            m.available &&
            // "물티슈", "직원호출"은 광고 대상이 아니다 (useTableMenu의 주문 메뉴 필터와 같은 기준)
            m.type !== "SERVICE" &&
            // 이미지 없는 메뉴는 아예 제외하는 것이 이 화면의 폴백 전략이다.
            // 메뉴 카드는 🍽️ 이모지로 대체하지만, 전체화면 광고에 이모지를 띄우면
            // 광고가 아니라 고장으로 보인다.
            // 타입상 image는 string이지만 DB는 null을 돌려주므로 런타임 가드가 필요하다.
            !!m.image,
        )
        .slice(0, limit),
    [menus, limit],
  );

  return { storeName: store?.name ?? "", showcase };
}
