---
version: alpha
name: kiorder
description: 거의 검은색에 가까운 캔버스(#111827)와 단 하나의 포인트 컬러 오렌지(#f97316)를 축으로 구성된 식당 운영 플랫폼이다. 오렌지는 모든 주요 CTA 버튼, 가격 표시, 대기번호에 사용되는 유일한 강조색이다. 제품은 세 가지 사용자 화면으로 나뉜다 — 손님용 키오스크·테이블오더는 밝은 환경에서도 즉시 읽히는 큼직한 터치 타겟을 요구하고, 주방·POS 직원 화면은 동일한 다크 쉘 안에 상태 변경 컨트롤을 촘촘히 담으며, 오너 관리 페이지는 반투명 흰색 테두리 기반의 데이터 테이블 중심으로 구성된다. 깊이감은 그림자 대신 배경 레이어 단계(페이지 → 카드 → 입력 필드)로만 표현한다. 모서리는 대부분 12px로, 현대적이면서도 소비자 앱보다는 업무 도구에 가깝게 읽힌다. 상태는 항상 색상 코드 반투명 배지로 표현된다 — 대기중/회색, 호출중/노랑+펄스, 입장완료/초록, 취소/빨강 — 덕분에 아이콘 없이도 운영자가 대기열 상태를 한눈에 파악할 수 있다.

colors:
  primary: "#f97316"
  primary-hover: "#ea580c"
  primary-disabled: "#7c3012"
  primary-tint: "rgba(249,115,22,0.10)"
  primary-tint-strong: "rgba(249,115,22,0.20)"
  success: "#22c55e"
  success-hover: "#16a34a"
  success-tint: "rgba(34,197,94,0.20)"
  success-border: "rgba(34,197,94,0.30)"
  warning: "#facc15"
  warning-hover: "#eab308"
  warning-tint: "rgba(250,204,21,0.20)"
  warning-border: "rgba(250,204,21,0.30)"
  danger: "#f87171"
  danger-hover: "#fca5a5"
  danger-tint: "rgba(239,68,68,0.10)"
  danger-tint-strong: "rgba(239,68,68,0.20)"
  danger-border: "rgba(239,68,68,0.30)"
  info: "#2563eb"
  info-hover: "#1d4ed8"
  canvas: "#030712"
  surface-page: "#111827"
  surface-card: "#1f2937"
  surface-input: "#374151"
  surface-overlay-soft: "rgba(255,255,255,0.05)"
  surface-overlay: "rgba(255,255,255,0.10)"
  surface-overlay-strong: "rgba(255,255,255,0.20)"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  text-primary: "#ffffff"
  text-secondary: "#9ca3af"
  text-muted: "#6b7280"
  text-label: "#d1d5db"
  text-danger: "#f87171"
  text-success: "#4ade80"
  text-warning: "#facc15"
  text-price: "#fb923c"
  border-default: "rgba(255,255,255,0.10)"
  border-strong: "rgba(255,255,255,0.20)"
  border-input: "#374151"
  scrim: "rgba(3,7,18,0.80)"

typography:
  display-number:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -2px
  display-lg:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  h1:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: -0.3px
  h2:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: 0
  h3:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  h4:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.44
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  badge:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
  table-header:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: 0.8px
    textTransform: uppercase
  button-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  button-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  price:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 64px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 10px 24px
    height: 44px
    transition: colors 150ms
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.text-muted}"
    cursor: not-allowed
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-strong}"
    padding: 8px 16px
    height: 40px
    transition: colors 150ms
  button-secondary-hover:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-primary}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.sm}"
    padding: 8px
    transition: colors 150ms
  button-ghost-hover:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-primary}"
  button-success:
    backgroundColor: "{colors.success-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 40px
    transition: colors 150ms
  button-danger:
    backgroundColor: transparent
    textColor: "{colors.danger}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.sm}"
    padding: 6px 12px
    transition: colors 150ms
  button-danger-hover:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.danger-hover}"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-default}"
    padding: 24px
  card-table:
    backgroundColor: "#111827"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-default}"
    overflow: hidden
  table-header-cell:
    backgroundColor: "rgba(31,41,55,0.50)"
    textColor: "{colors.text-secondary}"
    typography: "{typography.table-header}"
    padding: 12px 16px
  table-row:
    backgroundColor: transparent
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    borderBottom: "1px solid {colors.border-default}"
    padding: 16px
    transition: colors 150ms
  table-row-hover:
    backgroundColor: "{colors.surface-overlay-soft}"
  table-row-done:
    opacity: 0.40
    textDecoration: line-through
  input:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-input}"
    padding: 12px 16px
    height: 48px
    transition: border 150ms, box-shadow 150ms
  input-focus:
    borderColor: "{colors.primary}"
    boxShadow: "0 0 0 2px {colors.primary-tint}"
  input-placeholder:
    textColor: "{colors.text-muted}"
  badge-waiting:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-label}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.border-strong}"
    padding: 2px 8px
  badge-calling:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.warning-border}"
    padding: 2px 8px
    animation: pulse
  badge-seated:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.text-success}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.success-border}"
    padding: 2px 8px
  badge-cancelled:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.text-danger}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.danger-border}"
    padding: 2px 8px
  slide-sidebar:
    backgroundColor: "{colors.surface-card}"
    width: 320px
    borderLeft: "1px solid {colors.border-default}"
    position: fixed
    top: 0
    right: 0
    height: 100vh
    zIndex: 50
    transition: transform 300ms ease
  slide-sidebar-open:
    transform: translateX(0)
  slide-sidebar-closed:
    transform: translateX(100%)
  modal-backdrop:
    backgroundColor: "{colors.scrim}"
    backdropFilter: blur(4px)
    zIndex: 40
  page-shell:
    backgroundColor: "{colors.surface-page}"
    textColor: "{colors.text-primary}"
    minHeight: 100vh
---
