# CLAUDE.md — kiorder 프로젝트 규칙

## 협업 방식 (CRITICAL — 매 대화 반드시 적용)

- **백엔드 변경**: 확인 없이 바로 진행
- **프론트엔드 변경**: 변경 방향 + 기술적 이유 설명 → "진행할까요?" 확인 후 진행
- 사용자 동의 시 Claude가 직접 파일 수정
- 검증 시 "파일 보여주세요" 금지 → Claude가 직접 Read로 열어서 확인

## 코드 안내 방식

- 전체 코드 금지 → **바뀌는 부분만** 간략하게 + 변경 이유 함께 설명

## 작업 우선순위 (CRITICAL)

- **메인 작업은 프론트엔드** — 백엔드는 프론트 연동을 위한 수단
- 백엔드 작업이 길어지면 프론트 관점에서 필요한 것만 빠르게 처리하고 프론트로 복귀
- 코드 품질, UX, 실무 패턴은 프론트엔드 기준으로 더 깊게 다룬다

## 프로젝트 개요

**포트폴리오 프로젝트 — 맛있는 식당 (테이블오더 + 키오스크 웨이팅)**

- `frontend/` — Next.js 16 App Router
- `backend/` — NestJS + Prisma 7 + Supabase (PostgreSQL)
- Route Group: `(public)` / `(system)` / `(owner)`
- 인증: HttpOnly 쿠키 + jose jwtVerify (proxy.ts)
- Role: `SYSTEM_ADMIN` → `/system-admin/stores`, `STORE_OWNER` → `/owner/dashboard`
- 디자인 시스템(다크 테마 컬러·컴포넌트 규칙): 프론트 UI 작업 시 `DESIGN.md` 참고

> 이 문서에는 **규칙만** 적는다. 진행 상황·완료 이력·다음 할 일 같은 **상태는 적지 않는다**
> — `git log`와 세션 메모리가 기준이다. (두 곳에 적으면 반드시 한쪽이 낡는다)

### 프로젝트 목표 — 학습 모드

완성된 포트폴리오보다 **"AI로 팀을 꾸려 워크플로우를 배우는 것"**이 목표다.
로컬 `docs/roadmap.md`에 3단계(단일 에이전트 → 서브에이전트 팀 → Orca 병렬) 로드맵을 정의해 두었다.

### 팀 파이프라인 (하네스)

규모 있는 작업은 `.claude/skills/kiorder-flow/SKILL.md`의 절차를 따른다.

기획(`product-planner`) → **사람 판단** → 구현(`frontend-dev`) → 병렬 검증(`code-reviewer` ∥ `ux-reviewer`) → **사람 판단** → 반영·테스트

- 각 역할은 `.claude/agents/memory/{역할}.md`에 경험을 누적한다 (시작 시 읽고, 끝날 때 갱신)
- 작은 작업까지 파이프라인을 태우지 말 것 — 비용 가드 규칙은 SKILL.md 참고

## 브랜치 / PR 규칙

기능·버그·리팩토링은 **브랜치에서 작업하고 PR로 머지한다.** `main` 직접 커밋은 예외적으로만 쓴다.

### 브랜치를 파야 하는 것 / 아닌 것

| 작업 | 처리 |
|---|---|
| 새 기능, 버그 수정, 리팩토링, 여러 파일 변경 | **브랜치 + PR** |
| 오타, 문서 한두 줄, 설정값 하나 | `main` 직행 허용 |

작은 것까지 전부 PR로 태우면 의식만 남고 지친다 — `kiorder-flow`의 비용 가드와 같은 판단 기준이다.

### 브랜치 이름

커밋 타입과 같은 접두사를 쓴다: `feat/` `fix/` `refactor/` `chore/` `docs/`
예) `feat/pos-payment`, `fix/hall-order-lint`

### PR

- 본문은 **"무엇을"이 아니라 "왜"** — 커밋 메시지와 같은 기준
- **CI(`.github/workflows/ci.yml`)가 초록인지 확인하고 머지한다.** 빨간불을 무시하고 머지하지 않는다
- 머지 후 브랜치는 삭제한다

### 병렬 작업 (워크트리 여러 개)

`C:\orca\kiorder` 같은 별도 워크트리에서 동시에 작업할 땐 **워크트리마다 다른 브랜치를 잡는다.**
같은 `main`에서 각자 커밋한 뒤 `cherry-pick`으로 옮기지 말 것 — remote를 임시로 붙였다 떼는 작업이 생기고 커밋 해시가 갈라진다.

## 커밋 메시지 규칙 (CRITICAL — 커밋 작성 시 반드시 적용)

Gitmoji + Conventional Commits 혼합 형식을 따른다.

### 형식

```
[이모지] [타입]: [제목]

[본문 — 선택]
```

### 타입 + 이모지

| 이모지 | 타입 | 용도 |
|--------|------|------|
| ✨ | `feat` | 새 기능 |
| 🐛 | `fix` | 버그 수정 |
| 🎨 | `style` | UI/CSS 변경 (로직 무관) |
| ♻️ | `refactor` | 리팩토링 (기능 변화 없음) |
| 🔧 | `chore` | 설정, 패키지, 잡무 |
| 📝 | `docs` | 문서 |
| ✅ | `test` | 테스트 |
| ⚡️ | `perf` | 성능 개선 |
| 🚀 | `deploy` | 배포 |

### 규칙

- 제목은 50자 이내, 명령형, 마침표 없음
- 제목만으로 의미 전달이 충분하면 본문 생략
- 본문이 필요하면 "무엇을"이 아니라 **"왜"** 바꿨는지 설명
- 여러 변경이 섞여 있으면 가장 핵심 타입 하나로 대표

### 규칙 — 제목 작성법

- 타입만으로 부족할 때: **대상 + 변경 내용** 을 함께 쓴다
- "무엇을 했다" 보다 **"무엇을 어떻게/왜 했다"** 가 더 좋다
- 너무 길면 본문에 이유를 한 줄 추가한다

### 예시

```
✨ feat: 웨이팅 /waiting/[id] 손님 응답 버튼 3종 추가 (가고있어요·늦어요·취소)
🐛 fix: proxy.ts /unauthorized redirect 시 경로 누락으로 인한 무한 루프 수정
🎨 style: 대시보드 라이트 테마 → DESIGN.md 기준 다크 테마 전환
🔧 chore: Render 슬립 방지용 GET /health 엔드포인트 추가
♻️ refactor: 전체 fetch → apiFetch 공통 클라이언트로 교체 (10개 파일)
🚀 deploy: Render 백엔드 배포 환경변수 및 빌드 커맨드 설정
📝 docs: AI 에이전트용 kiorder 디자인 시스템 문서 작성 (DESIGN.md)
🔧 chore: Gitmoji + Conventional Commits 혼합 커밋 템플릿 설정
```

## 기술 스택 참고

- Prisma 7: `prisma.config.ts` + `@prisma/adapter-pg` 방식 (schema.prisma에 url 없음)
- JWT 365일 만료 (키오스크 특성상 401 처리 스킵)
- `import 'dotenv/config'`은 `main.ts` 최상단 필수
- `.claude/agents/*.md`는 **세션 시작 시 1회만 로드** → 새 역할을 만들면 세션을 재시작해야 호출 가능.
  반면 `.claude/skills/`는 만들자마자 즉시 인식된다
