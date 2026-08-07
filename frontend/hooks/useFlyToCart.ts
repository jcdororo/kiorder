import { useCallback, useRef, useState } from "react";
// 화면보호기도 같은 판정이 필요해져 lib/motion.ts로 옮겼다.
// 훅 마운트 시점이 아니라 fly() 호출 시점에 매번 확인하는 성질은 그대로다.
import { prefersReducedMotion } from "@/lib/motion";

export type Flight = {
  id: number;
  from: DOMRect;
  to: DOMRect;
  image?: string | null;
};

export function useFlyToCart(): {
  flights: Flight[];
  /** 비행을 실제로 만들었으면 true. 모션 최소화 설정이면 false를 돌려주므로
   *  호출부가 "착지 시점" 피드백을 즉시 발화시킬지 판단할 수 있다. */
  fly: (from: DOMRect, to: DOMRect, image?: string | null) => boolean;
  done: (id: number) => void;
} {
  const [flights, setFlights] = useState<Flight[]>([]);
  // 렌더 결과에 쓰이지 않는 값이라 state가 아니라 ref로 관리한다.
  // 연타로 같은 틱에 여러 번 호출돼도 id가 겹치지 않아 React key 중복이 없다.
  const nextIdRef = useRef(0);

  const fly = useCallback(
    (from: DOMRect, to: DOMRect, image?: string | null) => {
      // 접근성: 모션 최소화 설정이면 비행체를 아예 만들지 않는다.
      // (담기 자체는 호출부에서 이미 처리되므로 기능에는 영향이 없다)
      if (prefersReducedMotion()) return false;
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      setFlights((prev) => [...prev, { id, from, to, image }]);
      return true;
    },
    [],
  );

  const done = useCallback((id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { flights, fly, done };
}
