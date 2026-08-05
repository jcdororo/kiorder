# product-planner 누적 경험치

이 파일은 `product-planner` 역할이 kiorder를 검토하며 축적한 지식이다. 매 작업 시작 시 읽고, 새로 배운 것을 아래에 이어서 기록한다.

## 반드시 기억할 프로젝트 구조 (오판 1순위)

kiorder의 인증 role은 **`SYSTEM_ADMIN`과 `STORE_OWNER` 단 2개**다. "여러 직원 계정"이 아니라 **사장님 계정 하나를 각 디바이스(table-order / kitchen / hall / kiosk / pos)에 로그인시켜 역할 전용기로 쓰는 구조**다. 디바이스 자동감지가 아니라 계정을 사람이 아닌 매장에 귀속시킨 설계. 새 기능의 역할 배치를 판단할 때 이걸 착각하면 전제부터 틀린다.

`proxy.ts`의 `STORE_OWNER_PATHS = ["/owner","/table-order","/kitchen","/hall","/kiosk","/pos"]` 를 근거로 확인할 것.

## 현재 프로젝트 우선순위 (2026-08-05 기준)

**학습 모드로 전환됨** — `docs/roadmap.md` 기준, 완성된 포트폴리오보다 "AI로 팀을 꾸려 워크플로우를 배우는 것"이 목표다. 따라서 "이 기능을 지금 할 때인가"를 판단할 때 **포트폴리오 완성도만으로 판단하지 말 것**. CLAUDE.md의 "다음 할 일" 목록은 오래 갱신되지 않아 상당수 항목이 이미 완료됐다(stale 경고가 문서에 명시돼 있음).

## 확정된 설계 원칙 (충돌 여부 검토용)

- **메뉴 타입 3분류** — `FOOD`(주방+홀), `DRINK`/`SERVICE`(홀만). 주문 생성 시 `needsKitchen`을 스냅샷으로 복사해서 이후 메뉴 타입이 바뀌어도 과거 주문에 영향을 주지 않는다
- **OrderItem 불변 스냅샷** — `name`/`price`/`needsKitchen`을 주문 시점에 복사 저장
- **인증 전환은 hard navigation** — 로그인/로그아웃 후 이동은 `window.location.href`. soft nav(`router.push`)는 프록시가 갱신 전 쿠키를 보고 튕긴다. 단, 비인증 이동은 `router.push` 유지(SPA 속도 보존)
- **storeId 격리** — Supabase Realtime 구독도 매장별 필터 적용

## 선별 작업 시 기준
여러 항목을 우선순위화할 때는 **"실사용을 막는가"**를 1순위로, "포트폴리오/면접에서 설명 가치가 있는가"를 2순위로 본다. 완벽주의로 전부 처리하려다 아무것도 못 끝내는 패턴을 경계할 것 — 사용자가 명시적으로 지적한 반복 문제다.
