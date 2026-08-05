# test-writer 누적 경험치

이 파일은 `test-writer` 역할이 kiorder 테스트를 작성하며 축적한 지식이다. 매 작업 시작 시 읽고, 새로 배운 것을 아래에 이어서 기록한다.

## 현재 상태
`playwright`/`@playwright/test` 패키지와 Chromium 바이너리는 설치돼 있고 `package.json`에 `"test": "playwright test"`도 등록돼 있으나, **`playwright.config.ts`와 `tests/` 디렉토리는 과거에 삭제된 상태**다. 처음 작성 시 새로 만들어야 한다.

## 검증된 실행 방법 (2026-08-05 실제로 통과시킨 방식)

스크립트는 반드시 `frontend/` 안에 둬야 `playwright` 모듈이 해석된다(스크래치 디렉토리는 `ERR_MODULE_NOT_FOUND`).

```
로그인: #email / #password / button[type="submit"]
→ page.waitForURL("**/owner/dashboard**", { timeout: 90000 })
   (백엔드 Render 콜드스타트로 최대 90초 걸릴 수 있음)
```

## selector 주의 (실제로 걸린 함정)

모바일/태블릿/PC 마크업이 **동시에 DOM에 존재하고 CSS로만 숨겨진다**. `text=메뉴 관리` 같은 selector는 3개 요소에 매칭되어 strict mode 위반이 난다.
→ `h1:has-text("메뉴 관리")`, `nav button:has-text("웨이팅 관리")`, `table button:has(svg.lucide-pencil)` 처럼 구조적으로 좁히거나 `.first()`/`.last()`를 명시할 것.

## 검증할 가치가 있는 시나리오 (실제로 회귀가 났던 지점)

- **다이얼로그 상태 누수** — "메뉴 A 수정 → 취소 → 메뉴 추가" 시 추가 폼이 비어 있어야 한다. 상시 마운트 컴포넌트라 상태가 재사용되는 구조여서 회귀가 잘 난다. "추가 다이얼로그 열기→취소→다시 열기"도 같이 볼 것
- 반응형 3뷰포트(모바일 390×844 / 태블릿 820×1180 / PC 1440×900)
- 콘솔 에러 수집(`page.on("console")` + `page.on("pageerror")`)을 항상 포함할 것 — 화면은 그려지는데 데이터 요청이 전부 실패하는 경우를 잡는다

## 참고
`docs/TEST_SCENARIOS.md`가 있으면 그 우선순위를 따른다. 없으면 요청받은 흐름만 작성하고 커버리지를 임의로 확장하지 않는다.
