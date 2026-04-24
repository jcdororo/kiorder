# CLAUDE.md — kiorder 프로젝트 규칙

## 협업 방식 (CRITICAL — 매 대화 반드시 적용)

Claude는 코드를 직접 작성하거나 명령어를 직접 실행하지 않는다.
흐름: **Claude가 단계 안내 → 사용자가 직접 수행 → Claude가 Read 도구로 직접 파일 열어 검증**

- 작업 전 "무엇을 왜 할지" 먼저 설명
- 파일 작성/명령 실행/디렉토리 생성 → 사용자에게 지시
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

### 완료
- `/unauthorized` 페이지, 메인 페이지 email 표시, owner2/3 매장 생성
- Menu 백엔드 모듈 + 프론트 연동 완료 (react-hook-form + zod 검증 포함)
- auth/store/menu 전체 DTO 적용, ValidationPipe 전역 등록

### 다음 할 일
1. Supabase Realtime 프론트 연동 (주방 실시간 주문 수신)
   - `@supabase/supabase-js` 설치, `.env.local` Supabase 키 추가
   - 주방 페이지 Realtime 구독, 테이블오더 주문 제출 API 연동
2. WaitingEntry API 모듈 구현 + 프론트 연동
3. table-order/menu 페이지 id 타입 오류 수정

## 기술 스택 참고

- Prisma 7: `prisma.config.ts` + `@prisma/adapter-pg` 방식 (schema.prisma에 url 없음)
- JWT 365일 만료 (키오스크 특성상 401 처리 스킵)
- `import 'dotenv/config'`은 `main.ts` 최상단 필수
