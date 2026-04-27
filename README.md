# KiOrder 🍽️

> **테이블오더 + 키오스크 웨이팅을 하나의 플랫폼으로**  
> 식당 사장님을 위한 올인원 SaaS — 주문, 웨이팅, 주방, 메뉴를 실시간으로 관리합니다.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## 🗺️ 서비스 구조

```
[손님 — 키오스크]      [손님 — 테이블오더]
     │                       │
     ▼                       ▼
  POST /waiting          POST /orders
     │                       │
     └──────────┬────────────┘
                ▼
           NestJS API
                │
           Prisma ORM
                │
          Supabase DB (PostgreSQL)
                │
      Supabase Realtime (CDC)
                │
     ┌──────────┴──────────┐
     ▼                     ▼
[주방 화면]         [오너 웨이팅 관리]
(실시간 주문 수신)  (신규 대기 즉시 반영)
```

---

## 👥 역할 구조

| 역할 | 접근 경로 | 주요 기능 |
|------|-----------|-----------|
| **System Admin** | `/system-admin/stores` | 매장 목록 관리, 구독 승인/해제 |
| **Store Owner** | `/owner/dashboard` | 메뉴·웨이팅·주문 관리 |
| **손님 — 키오스크** | `/kiosk/waiting` | 웨이팅 등록, QR 대기표 수령 |
| **손님 — 테이블오더** | `/table-order/:tableId/menu` | 메뉴 조회, 주문 제출 |
| **주방** | `/kitchen/orders` | 주문 수신(Realtime), 상태 변경 |

---

## ✨ 핵심 기능

### 🏪 키오스크 웨이팅 플로우
- 터치 키패드로 전화번호 입력 → 인원수 선택 → `POST /waiting` 제출
- 완료 화면: **태블릿 가로 레이아웃** (대기번호 + QR코드 2분할)
- QR 스캔 시 손님 전용 대기현황 페이지로 이동

### 📱 손님용 실시간 대기현황 (`/waiting/status/[id]`)
- **15초 자동 갱신** (setInterval + fetchRef 패턴으로 클로저 문제 방지)
- 수동 새로고침 버튼 (1초 쿨다운)
- **앞 대기 팀 수** 서버사이드 계산: `status IN ('대기중', '호출중') AND number < 내번호`  
  → 전체 목록을 내려주지 않고 집계값만 반환해 **개인정보(전화번호) 노출 차단**
- SEATED/CANCELLED 상태면 "만료된 페이지" 처리

### 👨‍🍳 주방 화면 (Supabase Realtime)
- 페이지 진입 시 `GET /orders` 초기 로드
- `Supabase Realtime postgres_changes` 구독으로 새 주문 **자동 반영** (폴링 없음)
- 칸반 보드: 접수됨 → 조리중 → 완료, 조리 시간 측정 및 15분 초과 시 빨간 타이머

### 📋 오너 웨이팅 관리
- Supabase Realtime으로 키오스크 신규 등록 **즉시 반영**
- 입장완료/취소 처리 시 목록에서 삭제 대신 **맨 뒤로 정렬 + 취소선 처리** — 운영 맥락 보존
- 전화번호 마스킹 (`010-****-5678`)

### 🍜 테이블오더
- `GET /menu`로 메뉴 로드, FAB 버튼 + 오른쪽 슬라이드 장바구니
- 테이블 ID를 URL 파라미터로 식별 (`/table-order/[tableId]/menu`)
- `POST /orders` 제출 시 주방 화면에 Realtime 수신

### ⚙️ 메뉴 관리
- `react-hook-form` + `zod` 스키마 검증
- 판매중/품절 Switch 토글 (`PATCH /menu/:id`)
- 카테고리별 필터링

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 역할 |
|------|------|
| **Next.js 15** (App Router) | SSR/CSR 혼합, Route Group으로 역할별 레이아웃 분리 |
| **TypeScript** | 전 레이어 타입 안전성 확보 |
| **Tailwind CSS** + **shadcn/ui** | 다크 모던 UI 시스템 |
| **Supabase Realtime** | WebSocket 기반 DB 변경 구독 |
| **react-hook-form** + **zod** | 폼 상태관리 + 스키마 검증 |
| **react-qr-code** | QR코드 클라이언트 생성 |
| **sonner** | Toast 알림 |

### Backend
| 기술 | 역할 |
|------|------|
| **NestJS** | REST API, 모듈/서비스/컨트롤러 구조 |
| **Prisma 7** | 타입세이프 ORM (`@prisma/adapter-pg` 어댑터 방식) |
| **Supabase (PostgreSQL)** | 메인 DB + Realtime CDC |
| **Passport JWT** | HttpOnly 쿠키 기반 인증 |
| **class-validator** | DTO 레벨 입력 검증, ValidationPipe 전역 등록 |

### 인증 아키텍처
```
로그인 → NestJS가 HttpOnly 쿠키(access_token) 발급
              │
              ▼
Next.js proxy.ts (jose jwtVerify)
              │
    ┌─────────┴──────────┐
    ▼                    ▼
SYSTEM_ADMIN        STORE_OWNER
/system-admin/*     /owner/*
```
- **XSS 방어**: JS에서 쿠키 접근 불가 (HttpOnly)
- **CSRF 방어**: SameSite=lax
- **서명 검증**: `jose jwtVerify` (단순 디코딩 아님)

---

## 🗄️ DB 스키마

```prisma
User       1──1  Store
Store      1──N  Table
Store      1──N  MenuItem
Store      1──N  Order
Store      1──N  WaitingEntry
Order      1──N  OrderItem
Table      1──N  Order
MenuItem   1──N  OrderItem
```

> **Prisma 7 주의사항**: `schema.prisma`에 `datasource url` 사용 불가.  
> 런타임은 `@prisma/adapter-pg`로 직접 연결, CLI 마이그레이션은 `prisma.config.ts`의 `DIRECT_URL` 사용.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Supabase 프로젝트 (PostgreSQL)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL, DIRECT_URL, JWT_SECRET 설정
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_SUPABASE_URL 등 설정
npm run dev
```

### 환경변수 목록

**backend/.env**
```
DATABASE_URL=         # Supabase pooler (port 6543)
DIRECT_URL=           # Supabase direct (port 5432)
JWT_SECRET=           # 64바이트 랜덤 hex
FRONTEND_URL=         # CORS 허용 origin
```

**frontend/.env.local**
```
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_FRONTEND_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
JWT_SECRET=           # 백엔드와 동일값 (proxy.ts jwtVerify용)
```

---

## 📁 프로젝트 구조

```
kiorder/
├── frontend/                     # Next.js 15 App Router
│   ├── app/
│   │   ├── (public)/             # 인증 불필요 (로그인, 대기현황)
│   │   ├── (owner)/              # 사장님 전용 (kiosk, kitchen, pos, owner/*)
│   │   └── (system)/             # 시스템 어드민
│   ├── components/
│   ├── lib/supabase.ts           # Supabase Realtime 클라이언트
│   ├── types/types.ts            # 공유 인터페이스
│   └── proxy.ts                  # Route Guard (jose jwtVerify)
│
└── backend/                      # NestJS
    ├── src/
    │   ├── auth/                 # JWT 인증, HttpOnly 쿠키
    │   ├── store/                # 매장 관리
    │   ├── menu/                 # 메뉴 CRUD
    │   ├── order/                # 주문 (Realtime 트리거)
    │   ├── table/                # 테이블
    │   ├── waiting-entry/        # 웨이팅 (ahead 집계 포함)
    │   └── prisma/               # PrismaService (@prisma/adapter-pg)
    └── prisma/
        ├── schema.prisma
        └── prisma.config.ts      # Prisma 7 CLI 설정
```

---

## 📌 설계 포인트

**왜 Supabase Realtime인가?**  
WebSocket 서버를 직접 구축하는 대신, Supabase의 PostgreSQL CDC(Change Data Capture)를 활용해 DB 변경을 클라이언트에 브로드캐스트합니다. NestJS는 순수 REST에만 집중하고 실시간 레이어는 Supabase가 담당하는 관심사 분리 구조입니다.

**왜 HttpOnly 쿠키인가?**  
localStorage 방식은 XSS 공격 시 토큰이 탈취됩니다. 키오스크·테이블오더처럼 불특정 다수가 접근하는 환경에서는 HttpOnly 쿠키가 필수입니다.

**앞 대기 팀 수를 왜 서버에서 계산하나?**  
클라이언트에 전체 대기 목록을 내려주면 다른 손님의 전화번호가 노출됩니다. 서버에서 `COUNT` 집계값만 반환해 개인정보를 보호합니다.

---

## 🌐 배포

| 서비스 | 플랫폼 |
|--------|--------|
| Next.js | Vercel |
| NestJS | Railway / Render |
| Database | Supabase |

---

<p align="center">
  Made with ☕ by <a href="https://github.com/jcdororo">jcdororo</a>
</p>
