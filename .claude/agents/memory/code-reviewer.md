# code-reviewer 누적 경험치

이 파일은 `code-reviewer` 역할이 kiorder를 리뷰하며 축적한 지식이다. 매 작업 시작 시 읽고, 새로 배운 것을 아래에 이어서 기록한다. (인스턴스는 매번 백지에서 시작하므로 이 파일이 기억을 대신한다.)

## 이 프로젝트에서 반복 확인된 패턴

### 리팩토링 검토 시 최우선으로 볼 것
"순수 마크업 이동"이라 주장하는 리팩토링에서 **실제로 로직이 바뀌는 지점은 상태 초기화 타이밍**이다. 페이지가 핸들러에서 동기적으로 하던 일(`form.reset()` 등)을 컴포넌트 내부 `useEffect`로 옮기면, effect는 커밋(페인트) 이후 실행되므로 첫 프레임에 이전 값이 남는다. 특히 **컴포넌트가 상시 마운트되어 내부 state가 재사용되는 경우** 반드시 지적한다.

### 수정 제안 시 반드시 함께 검증할 것
`key` 기반 리마운트를 제안할 때는 **그 key가 실제로 바뀌는지** 확인해야 한다. 2026-08-05 실제 사례: `key={editingItem?.id ?? "new"}`를 제안했으나, "추가 다이얼로그 열기→취소→다시 열기"에서는 id가 계속 `"new"`라 리마운트가 안 되어 직전 입력이 남는 새 회귀가 생겼다. 오케스트레이터가 `key`에 `open` 상태까지 포함시켜 해결했다. **제안한 패턴이 깨뜨리는 다른 케이스를 스스로 먼저 따져볼 것.**

### 확인해두면 시간 아끼는 것들
- shadcn `DialogTrigger`는 `composeEventHandlers`로 사용자 `onClick`과 `onOpenToggle`을 같은 이벤트에서 함께 실행한다 → 트리거 버튼이 `setOpen(true)`를 직접 호출하지 않아도 정상 동작. 이걸 버그로 오인하지 말 것
- `npx tsc --noEmit`은 frontend 디렉토리에서 실행. eslint 전체 실행 시 이번 diff 범위 밖 파일(`hall/order`, `system-admin/stores`)에서 기존 에러가 나오므로 **변경 파일과 무관한 것은 리포트하지 말 것**
- `MenuFormDialog.tsx`의 `<img>` eslint 경고는 blob 미리보기라 원래 의도된 것(next/image 최적화 대상 아님)

### eslint 베이스라인 대조 기법 (실제로 효과 본 방법)
`git stash`로 diff 적용 전/후 `npx eslint .` 결과를 비교하면 **이 diff가 새로 추가한 에러만** 정확히 골라낼 수 있다. 2026-08-05 기준 베이스라인은 **1 error + 2 warning**:
- `hall/order/page.tsx:40` react-hooks/set-state-in-effect (error)
- `system-admin/stores/page.tsx:45` 미사용 `apiFetch` (warning)
- `MenuFormDialog.tsx:256` `<img>` 경고 (warning, blob 미리보기라 의도된 것)

이 숫자와 다르면 새 diff가 뭔가 추가한 것이다.

### `Date.now()`를 컴포넌트 렌더 바디에 직접 쓰면 `react-hooks/purity` 에러
`useQuery`의 `queryFn`/`select` 콜백 안에서 쓰는 건 lint가 안 잡지만, 컴포넌트 함수 바디에 그대로 쓰면 "impure function during render" 에러가 난다. **시간 경과 계산을 추가하는 diff를 볼 때마다 이 위치를 확인할 것.** 2026-08-05 `owner/waiting`의 `avgElapsed`가 이 케이스였고, 계산을 `queryFn`으로 옮겨 해결했다.

### 클램프 정책 불일치를 의심할 것
개별 항목 표시용 포맷터에는 음수 방어가 있는데 집계(평균/합계) 쪽에는 없는 경우가 있다. "개별은 전부 0분인데 상단 통계만 -1분" 같은 불일치가 시계 오차로 실제 발생 가능. 같은 데이터를 두 군데서 계산하면 항상 의심할 것.

## 알려진 기존 갭 (이번 diff의 회귀가 아님 — 중복 지적 주의)
- `useOwnerMenu`는 `isLoading`/`isError`를 노출하지 않아 `/owner/menu`에 로딩·에러 UI가 없다. `/owner/waiting`과 대조적. 리팩토링 이전부터 있던 갭
- **`.dark` 클래스가 영구 비활성** — `globals.css`에 `:root`(라이트)와 `.dark`(다크) 변수가 둘 다 있지만, 리포 어디에도 `next-themes`/`ThemeProvider`가 없고 `<html>`에 `.dark`를 붙이는 코드도 없다. 그래서 `bg-primary`가 거의 검정(`#030213`)으로 나온다. `button.tsx`(default variant)·`badge.tsx`·`system-admin/stores`도 같은 영향권. "버튼/배지가 이상하게 어둡다"는 증상이 나오면 여기가 원인
