---
name: kiorder-context
description: kiorder 프로젝트의 구조·컨벤션·API 지도를 한 번에 제공하는 공유 레퍼런스. kiorder의 프론트엔드/백엔드 코드를 읽거나 수정하거나 리뷰하기 직전에 반드시 이 스킬을 먼저 읽을 것. 라우트 구조, apiFetch 분기, React Query 컨벤션, 기존 컴포넌트·훅 목록, 백엔드 엔드포인트, 인증 흐름을 담고 있어 매번 코드베이스를 탐색하는 비용을 없애준다. "이 파일 어디 있지", "이런 컴포넌트 이미 있나", "API가 뭐가 있지" 같은 탐색이 필요할 때도 이 스킬을 먼저 본다.
---

# kiorder 프로젝트 컨텍스트

에이전트는 매번 백지 상태로 시작한다. 이 문서는 그 백지를 메우기 위한 지도다.
**모르는 것을 추측하지 말고 여기 적힌 경로를 Read로 직접 확인한다.** 이 문서는 지도이지 코드의 사본이 아니다.

## 스택

| | |
|---|---|
| 프론트 | Next.js 16.2.3 App Router · React 19.2.4 · Tailwind v4 · TanStack Query v5 · react-hook-form + zod |
| 백엔드 | NestJS 11 · Prisma 7 (`@prisma/adapter-pg`) · Supabase PostgreSQL |
| 실시간 | Supabase Realtime (브라우저 ↔ Supabase 직통, `storeId`로 매장별 필터) |
| 배포 | 프론트 Vercel · 백엔드 Render (무료 티어 콜드스타트 30~60초) |

**작업 우선순위: 프론트엔드가 메인이다.** 백엔드는 프론트 연동을 위한 수단이므로, 백엔드 작업이 길어지면 프론트에 필요한 것만 빠르게 처리하고 돌아온다.

## 라우트 구조

```
frontend/app/
├── page.tsx                             랜딩 (정적, #screens 앵커에 화면 둘러보기)
├── unauthorized/page.tsx
├── (public)/                            비인증
│   ├── login/
│   └── waiting/[waitingId]/             손님용 대기현황 (QR 스캔 진입)
├── (system)/system-admin/stores/        SYSTEM_ADMIN 전용
└── (owner)/                             STORE_OWNER 전용 (매장 디바이스 전체)
    ├── kiosk/waiting · kiosk/complete
    ├── table-order/ · table-order/[tableId]/menu
    ├── kitchen/orders
    ├── hall/orders · hall/order
    ├── pos/
    └── owner/dashboard · owner/menu · owner/waiting · owner/table-settings
```

**인증**: HttpOnly 쿠키 + `frontend/proxy.ts`에서 jose `jwtVerify`로 검증.
role은 `SYSTEM_ADMIN`, `STORE_OWNER` **두 개뿐**이다. 사장님 계정 하나로 매장의 모든 디바이스 화면에 접근한다(디바이스 자동감지가 아니라, 계정을 사람이 아닌 매장에 귀속시킨 설계).

## 프론트 컨벤션 (위반하면 리뷰에서 지적 대상)

**데이터 페칭은 항상 TanStack Query.** `useEffect` + `fetch` 직접 호출은 금지다 — 프로젝트 전체를 이미 React Query로 통일해 놨고, 캐시 공유(`queryKey`)가 깨진다.

**`apiFetch`(`frontend/lib/api.ts`)를 쓴다.** 브라우저에서는 `/api/proxy`를 경유하고 서버에서는 백엔드로 직통하는 분기가 들어 있다. 단, **인증이 필요한 서버 컴포넌트에서는 쓸 수 없다** — 쿠키가 안 실리므로 `next/headers`의 `cookies()`가 필요하다.

**인증 전환은 `window.location.href`(하드 내비게이션)로 한다.** `router.push`(소프트 내비)를 쓰면 미들웨어가 갱신 전 쿠키를 보고 튕기는 레이스가 배포 환경(`SameSite=None; Secure`)에서 터진다. 실제로 겪은 버그다. 비인증 이동은 `router.push`/`Link` 그대로 써도 된다.

**공유 `queryKey`**: `["menu"]`, `["tables"]`, `["store","my"]`는 여러 화면이 캐시를 공유한다. 새 키를 만들기 전에 기존 키 재사용을 먼저 검토한다.

**에러/로딩 컨벤션**: `queryFn`에서 `!res.ok`면 상태 코드를 담아 `throw`한다(빈 배열 반환으로 삼키지 않는다). 페이지는 `isLoading` → 스켈레톤, `isError` → `ErrorState`.

**effect 안에서 setState 금지.** 서버 데이터로 초기값을 맞춰야 하면 effect 동기화 대신 렌더 중 파생값으로 계산한다(`const effective = selected || list[0]?.id || ""`). `react-hooks/set-state-in-effect`가 CI에서 에러로 잡힌다.

## 이미 있는 것 — 새로 만들기 전에 확인하라

**훅** (`frontend/hooks/`): `useTableMenu(tableId)` · `useOwnerMenu({onSaved})` · `usePosOrders({onPaid})` · `useFlyToCart()` · `useIdle({idleMs,enabled,onWake})` · `useScreensaverContent()`
> 설계 원칙: 훅은 서버 통신·파생값만, 페이지는 UI 오케스트레이션. 다이얼로그 닫기 같은 뒷정리는 훅에 박지 말고 콜백으로 페이지에 위임한다.

**타입** (`frontend/types/`): `menu.ts` · `order.ts` · `store.ts` · `waiting.ts` (도메인별 분리 완료. 단일 `types.ts`는 삭제됨)

**컴포넌트** (`frontend/components/`)
- `shared/` — `BackToTour`(홈 버튼, `variant="icon"` 지원) · `ErrorState`(onRetry) · `Skeleton` · `BoardSkeleton`(칸반 3열)
- `owner/` — `OwnerSidebar`(menu·waiting 공유, `active` prop) · `MenuFormDialog` · `MenuTable` · `MenuCard` · `MenuTypeBadge` · `OrderStatusBadge` · `Tables`
- `kitchen/OrderCard` · `hall/OrderCard` · `kiosk/QrCode` · `kiosk/KioskCompleteCountdown` · `kiosk/TabletFrame`
- `table-order/` — `CartSheet`(+`CartPanel`) · `FlyingThumb`
- `screensaver/Screensaver`(유휴 시 광고 오버레이. 키오스크 웨이팅 60초·테이블오더 180초) · `screensaver/ScreensaverDeck`
- `components/ui/` — shadcn/ui. 미사용 34개는 이미 정리됨

**디자인 토큰**: 다크 테마. 색·간격 규칙은 루트 `DESIGN.md`(296줄)를 Read해서 확인한다. 이 문서에 복사해두지 않는 이유는 원본이 갱신되면 사본이 낡기 때문이다.

## 백엔드 API 지도

| 모듈 | 엔드포인트 |
|---|---|
| auth | `POST /auth/register` `POST /auth/login` `POST /auth/logout` |
| menu | `GET /menu` `POST /menu` `PATCH /menu/:id` `DELETE /menu/:id` |
| order | `POST /orders` `GET /orders`(`?tableId=`) `PATCH /orders/:id/status` `PATCH /orders/:id/hall-receive` |
| store | `GET /stores/my` `GET /stores` `POST /stores` |
| table | `GET /tables` |
| waiting | `POST /waiting` `GET /waiting` `GET /waiting/status/:id` `PATCH /waiting/:id/status` `PATCH /waiting/:id/guest-response` |

**도메인 규칙**
- `MenuItem.type`: `FOOD`(주방+홀) / `DRINK`·`SERVICE`(홀만). 주문 생성 시 `OrderItem.needsKitchen`에 **스냅샷 복사**한다 — 이후 메뉴 타입이 바뀌어도 과거 주문이 영향받지 않게 하려는 의도다.
- `Order.hallReceived` — 홀 수령 토글. 홀 완료 버튼은 이 값이 false면 비활성.
- `GET /orders`에 `tableId`가 있으면 `결제완료`를 DB 레벨에서 제외한다.

**Prisma 7 주의**: `schema.prisma`에 url이 없다. `prisma.config.ts`가 `DIRECT_URL`(CLI용), `prisma.service.ts`가 `DATABASE_URL`(런타임)을 쓴다. 타입 에러가 나면 stale client일 수 있으니 `npx prisma generate`를 먼저 의심한다.

## 검증 명령

```bash
cd frontend && npx tsc --noEmit && npm run lint
cd backend && npx prisma generate && npm run build
```

**CI(`.github/workflows/ci.yml`)가 PR마다 위 명령을 자동 실행한다.** 타입·린트·빌드가 통과하는지는 CI가 판정하므로, 리뷰에서 같은 것을 반복 확인하는 데 토큰을 쓰지 않는다.

`backend`의 `npm run lint`는 `--fix`가 붙어 **파일을 수정한다.** 검사만 하려면 `npx eslint "{src,apps,libs,test}/**/*.ts"`를 쓴다.

## 로컬 실행 / 테스트 계정

- 프론트: `cd frontend && npm run dev` (3000)
- 계정: `owner1@test.com` / `test1234` (STORE_OWNER). **SYSTEM_ADMIN 계정은 없다** — `/system-admin/*` 화면은 육안 검증이 불가능하다.
- `frontend/.env`의 `NEXT_PUBLIC_BACKEND_URL`이 **배포된 Render를 가리킨다.** 로컬 백엔드 수정을 화면으로 확인하려면 `.env.local`로 오버라이드해야 한다. 이걸 놓치면 검증 자체가 무의미해진다.

## 커밋 · 브랜치

- 커밋: Gitmoji + Conventional (`✨ feat:` `🐛 fix:` `🎨 style:` `♻️ refactor:` `🔧 chore:` `📝 docs:`). 본문은 "무엇을"이 아니라 **"왜"**.
- 기능·버그·리팩토링은 브랜치(`feat/` `fix/` `refactor/` `chore/`) + PR. 오타·문서 한 줄은 `main` 직행 허용.
- 여러 줄 한글 커밋 메시지는 PowerShell here-string이 깨지므로 파일로 써서 `git commit -F`를 쓴다.
