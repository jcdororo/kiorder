---
name: kiorder-flow
description: This skill should be used when a kiorder feature, fix, or improvement needs to go through the full team pipeline — planning, implementation, parallel review, and verification. Invoke it when the user says "이 기능 팀으로 진행해줘", "하네스로 돌려줘", "파이프라인 태워줘", or when a task is large enough that ad-hoc delegation would lose track of decisions. Not for one-line fixes.
version: 0.1.0
---

# KIORDER 팀 파이프라인

kiorder의 5개 역할(`.claude/agents/`)을 정해진 순서로 소집해 하나의 작업을 끝까지 끌고 가는 절차다. 오케스트레이터(메인 세션)가 이 문서를 따라 각 단계를 진행한다.

## 실행 모드 — Subagents (제약에서 나온 결정)

kiorder의 서브에이전트들은 서로 통신할 수 없다(부모에게만 반환). 따라서 **팀원끼리 조율하는 Agent Teams 모드는 쓸 수 없고**, 단계 간 전달은 **반환값 + 파일 기반**으로 한다.

- 각 단계 산출물은 `_workspace/{순번}_{산출물}.md`에 저장한다 (`_workspace/`는 gitignore 대상, 중간물이라 커밋하지 않는다)
- 다음 단계 역할에게는 **"이 파일을 먼저 읽어라"**를 프롬프트에 명시한다 — 서브에이전트는 이전 대화를 전혀 모르므로 이게 유일한 인수인계 수단이다

## 파이프라인

```
[1 기획]  product-planner        → _workspace/1_plan.md
   ◆ 사람 판단 체크포인트 ◆
[2 구현]  frontend-dev           → _workspace/2_impl.md
[3 검증]  code-reviewer ∥ ux-reviewer  → _workspace/3_review_code.md, 3_review_ux.md
   ◆ 사람 판단 체크포인트 ◆
[4 반영]  frontend-dev → test-writer → 커밋
[5 학습]  각 역할 메모리에 이어서 기록
```

### 1. 기획 — `product-planner`

요청을 kiorder의 목표·역할구조·기존 설계 원칙에 비춰 검토시킨다. 산출물을 `_workspace/1_plan.md`에 쓰게 한다.
여러 항목(예: 리뷰 지적 목록)을 처리할 때는 **우선순위 선별까지** 시킨다 — 전부 하려다 아무것도 못 끝내는 패턴을 막는다.

### ◆ 체크포인트 1 — 사람이 결정한다

기획 결과를 사용자에게 보여주고 **무엇을 할지 직접 고르게 한다**. 자동으로 다음 단계로 넘어가지 않는다.

> 이 체크포인트를 없애면 안 된다. `docs/roadmap.md`의 핵심 원칙이 "AI가 뭘 했나가 아니라 내가 어떤 판단을 했나"이고, 전 과정을 자동화하면 그 기록 자체가 사라진다. 자동화의 상한을 의도적으로 정하는 것이 이 하네스의 설계 의도다.

### 2. 구현 — `frontend-dev`

승인된 범위만 구현시킨다. `_workspace/1_plan.md`를 먼저 읽으라고 지시하고, 결과를 `_workspace/2_impl.md`에 남기게 한다.

**병렬 위임 규칙 (중요 — 실제로 충돌났던 부분)**: 서로 다른 파일을 만드는 작업만 병렬로 돌린다. **같은 파일을 여러 에이전트가 동시에 수정하면 서로 덮어쓴다.** 신규 파일 생성은 fan-out으로 병렬, 기존 파일에 연결하는 작업은 오케스트레이터가 직접 순차 처리한다.

### 3. 검증 — `code-reviewer` ∥ `ux-reviewer` (병렬)

관점이 달라 서로 간섭하지 않으므로 **한 메시지에서 동시에 호출**한다.
- `code-reviewer` — 타입/보안/엣지케이스/컨벤션. Write 권한이 없어 코드를 고칠 수 없다(의도된 격리)
- `ux-reviewer` — 실제 브라우저를 띄워 스크린샷으로 화면을 본다. 코드만 읽어서는 못 잡는 것(리스트 재정렬, 죽은 어포던스 등)을 잡는 역할

둘 다 `_workspace/3_review_{code,ux}.md`에 결과를 쓰게 한다.

### ◆ 체크포인트 2 — 사람이 결정한다

리뷰 지적 중 **무엇을 반영할지 사용자가 고른다.** 리뷰어 제안을 그대로 적용하지 말고, 그 제안이 깨뜨리는 다른 케이스가 없는지 먼저 따진다.

> 실제 사례: 리뷰어가 폼 리셋 문제에 `key={editingItem?.id ?? "new"}`를 제안했으나, 그대로 쓰면 "추가 다이얼로그를 열었다 닫고 다시 열기"에서 id가 같아 리마운트가 안 되는 새 회귀가 생겼다. `key`에 `open` 상태까지 포함시켜 해결했다. **표준 패턴이라고 검증 없이 적용하지 않는다.**

### 4. 반영 → 테스트 → 커밋

수정 후 `cd frontend && npx tsc --noEmit`으로 타입 확인. 화면 변경이 있으면 Playwright로 실제 렌더를 재확인한다(`ux-reviewer`가 쓰는 방식과 동일).
커밋은 **성격별로 분리**한다 — 하네스/설정 변경은 `🔧 chore`, UI 버그 수정은 `🐛 fix`, 구조 개선은 `♻️ refactor`. 커밋 메시지 형식은 `CLAUDE.md`의 규칙을 따른다.

### 5. 학습 — 역할 메모리 이어서 기록

이번 작업에서 각 역할이 새로 알게 된 것(반복되는 실수 패턴, 이 프로젝트 특유의 함정)을 `.claude/agents/memory/{역할}.md`에 이어서 기록하게 한다. 이게 역할이 회를 거듭할수록 전문성이 쌓이는 유일한 경로다 — 인스턴스 자체는 매번 백지에서 시작하므로, 파일이 기억을 대신한다.

## 언제 팀을 소집하지 말아야 하는가 (비용 가드)

서브에이전트는 **격리가 필요할 때만** 값어치가 있다. 2026 가이던스: *"Use a skill when there is real domain logic. Use a subagent for isolated, parallel work."*

**소집할 이유가 있는 경우**
- 툴 권한 격리가 의미 있을 때 — `code-reviewer`/`product-planner`는 Write 권한이 없어 "리뷰만 하고 못 고침"이 구조적으로 보장된다
- 탐색량이 많아 본채 컨텍스트를 오염시킬 때 — `ux-reviewer`는 스크린샷 여러 장과 파일 다수를 뒤진다
- 독립된 파일을 동시에 만드는 병렬 작업일 때

**소집하지 말 것**
- 단일 파일 순차 수정, 한두 줄 고치기 → 오케스트레이터가 직접 한다
- 파이프라인 전체가 과한 작은 작업 → 필요한 단계만 골라 쓴다. 5단계를 항상 다 돌 필요는 없다

**근거**: `ux-reviewer` 1회 실행에 약 9만 토큰이 든다. 팀 소집은 공짜가 아니며, "팀을 꾸릴 수 있다"보다 **"언제 꾸릴 가치가 있는지 판단할 줄 안다"**가 실제 역량이다.
