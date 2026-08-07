/**
 * SSR에는 window가 없고, 사용자가 OS 설정을 도중에 바꿀 수도 있으므로
 * 모듈 로드 시점에 값을 굳히지 않고 호출할 때마다 확인한다.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
