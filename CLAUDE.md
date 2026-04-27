# CLAUDE.md — kiorder 프로젝트 규칙

## 협업 방식 (CRITICAL — 매 대화 반드시 적용)

- **백엔드 변경**: 확인 없이 바로 진행
- **프론트엔드 변경**: 변경 방향 + 기술적 이유 설명 → "진행할까요?" 확인 후 진행
- 사용자 동의 시 Claude가 직접 파일 수정
- 검증 시 "파일 보여주세요" 금지 → Claude가 직접 Read로 열어서 확인

## 코드 안내 방식

- 전체 코드 금지 → **바뀌는 부분만** 간략하게 + 변경 이유 함께 설명

## 인사 시 자동 브리핑 (CRITICAL)

사용자가 "안녕 클로드" 등 인사말로 시작하면:
1. 메모리 파일 읽기 (`memory/project_frontend_migration.md`, `memory/project_backend_setup.md`)
2. "지난번엔 ~까지 했고, 오늘은 ~부터 시작하면 됩니다" 형식으로 브리핑
3. 사용자가 먼저 물어보지 않아도 자동 수행

## 작업 우선순위 (CRITICAL)

- **메인 작업은 프론트엔드** — 백엔드는 프론트 연동을 위한 수단
- 백엔드 작업이 길어지면 프론트 관점에서 필요한 것만 빠르게 처리하고 프론트로 복귀
- 코드 품질, UX, 실무 패턴은 프론트엔드 기준으로 더 깊게 다룬다

## 프로젝트 개요

**포트폴리오 프로젝트 — 맛있는 식당 (테이블오더 + 키오스크 웨이팅)**

- `frontend/` — Next.js 15 App Router
- `backend/` — NestJS + Prisma 7 + Supabase (PostgreSQL)
- Route Group: `(public)` / `(system)` / `(owner)`
- 인증: HttpOnly 쿠키 + jose jwtVerify (proxy.ts)
- Role: `SYSTEM_ADMIN` → `/system-admin/stores`, `STORE_OWNER` → `/owner/dashboard`

## 현재 진행 상황

### 완료
- 프론트엔드 16개 페이지 이식 완료 (mock 데이터)
- 백엔드 Auth + Store 모듈 완료
- HttpOnly 쿠키 인증, Route Guard(proxy.ts) 완료
- 로그아웃 기능 완료
- `/unauthorized` 페이지, 메인 페이지 email 표시
- Menu 백엔드 모듈 + 프론트 연동 완료 (react-hook-form + zod 검증 포함)
- auth/store/menu 전체 DTO 적용, ValidationPipe 전역 등록
- Order 모듈 완료 (POST/GET/PATCH)
- Supabase Realtime 연동 완료 (주방 페이지 실시간 주문 수신)
- Table 모듈 완료, 테이블오더 `[tableId]/menu` 라우트 완료
- WaitingEntry 백엔드 모듈 완료 (4개 엔드포인트)
- `/kiosk/waiting` + `/kiosk/complete` 프론트 연동 완료 (QR코드 포함)

- `/waiting/status/[waitingId]` 손님용 대기현황 페이지 완료 (15초 자동갱신, QR 연동)
- `/owner/waiting` 연동 완료 (다크 UI, Realtime, 정렬+취소선 처리)

### 다음 할 일
- 미정 (전체 핵심 기능 연동 완료)

## 기술 스택 참고

- Prisma 7: `prisma.config.ts` + `@prisma/adapter-pg` 방식 (schema.prisma에 url 없음)
- JWT 365일 만료 (키오스크 특성상 401 처리 스킵)
- `import 'dotenv/config'`은 `main.ts` 최상단 필수
