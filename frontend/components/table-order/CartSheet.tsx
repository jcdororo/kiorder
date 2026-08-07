"use client";

import type { Ref } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  Loader2,
  ChevronUp,
  X,
} from "lucide-react";
import { CartItem } from "@/types/order";

export type CartView = "cart" | "receipt";

type ReceiptLine = { name: string; price: number; quantity: number };

type CartPanelProps = {
  cartView: CartView;
  onChangeView: (view: CartView) => void;
  /**
   * fly-to-cart 도착점. **데스크톱 패널에서만** 넘긴다.
   * 시트 안의 같은 버튼에도 붙이면 두 인스턴스가 한 ref를 놓고 다투게 되고,
   * 나중에 마운트된 쪽(=가려진 쪽)이 이겨 좌표가 뒤집힌다.
   */
  cartTabRef?: Ref<HTMLButtonElement>;
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  /**
   * 배지를 리마운트시켜 "펌프"를 터뜨리는 키. 담기 시점이 아니라 비행체가
   * 도착한 시점에 증가하는 값이라야 두 연출이 인과로 읽힌다.
   */
  badgePulseKey: number;
  onIncrease: (item: CartItem) => void;
  onDecrease: (itemId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  orderCount: number;
  receiptItems: ReceiptLine[];
  grandTotal: number;
  tableNumber: number | string;
  receiptTime: string | null;
};

/**
 * 장바구니/주문내역 토글 + 두 뷰의 본문.
 *
 * 데스크톱의 우측 고정 열과 모바일 바텀시트가 **같은 마크업**을 쓰도록 뽑아낸 것이다.
 * (시트 파일에 함께 두는 이유: 시트 없이 단독으로 쓰이는 일이 없고,
 *  두 컴포넌트가 prop 타입을 공유해 파일을 나누면 타입만 왕복한다)
 *
 * 자기 높이를 스스로 정하지 않는다 — 부모가 `flex flex-col` + 확정 높이를 준다는 전제다.
 * 목록이 `flex-1 overflow-y-auto`라 부모 높이가 auto면 0으로 접힌다.
 */
export function CartPanel({
  cartView,
  onChangeView,
  cartTabRef,
  cart,
  totalItems,
  totalAmount,
  badgePulseKey,
  onIncrease,
  onDecrease,
  onSubmit,
  isSubmitting,
  orderCount,
  receiptItems,
  grandTotal,
  tableNumber,
  receiptTime,
}: CartPanelProps) {
  return (
    <>
      {/* 토글 태그.
          nowrap을 max-md로 한정한 이유: 시트는 전폭이라 접힘이 없어야 하지만,
          md 이상 우측 열은 w-1/4(820에서 205px)이고 두 탭이 nowrap이면 233px를
          요구해 `주문 내역`이 화면 밖으로 45px 잘린다. 원본이 2줄로 접혀 있었기에
          맞았던 폭 예산이다. */}
      <div className="shrink-0 px-4 py-3 border-b border-white/10 flex gap-2">
        <button
          ref={cartTabRef}
          onClick={() => onChangeView("cart")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium max-md:whitespace-nowrap transition-colors ${
            cartView === "cart"
              ? "bg-orange-500 text-white"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          장바구니
          {totalItems > 0 && (
            <span
              key={badgePulseKey}
              className={`animate-in zoom-in-50 duration-200 text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none ${
                cartView === "cart" ? "bg-white/25" : "bg-orange-500 text-white"
              }`}
            >
              {totalItems}
            </span>
          )}
        </button>
        <button
          onClick={() => onChangeView("receipt")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium max-md:whitespace-nowrap transition-colors ${
            cartView === "receipt"
              ? "bg-orange-500 text-white"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          주문 내역
          {orderCount > 0 && (
            <span
              className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none ${
                cartView === "receipt"
                  ? "bg-white/25"
                  : "bg-orange-500 text-white"
              }`}
            >
              {orderCount}
            </span>
          )}
        </button>
      </div>

      {/* 장바구니 뷰 */}
      {cartView === "cart" && (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:hidden">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center mt-10 text-sm">
                담긴 메뉴가 없습니다
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 animate-in slide-in-from-right-4 fade-in duration-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* {item.image ? (
                      <Image src={item.image} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#374151] flex items-center justify-center shrink-0">🍽️</div>
                    )} */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onDecrease(item.id)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    {/* 이미 담긴 메뉴를 또 담으면 새 줄이 생기지 않으므로,
                        수량 숫자를 리마운트시켜 변경을 알린다. */}
                    <span
                      key={item.quantity}
                      className="w-4 text-center text-sm animate-qty-bump"
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onIncrease(item)}
                      className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="shrink-0 px-6 py-5 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm">총 {totalItems}개</span>
              <span className="text-white font-bold text-lg">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
            <button
              disabled={cart.length === 0 || isSubmitting}
              onClick={onSubmit}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-gray-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 주문 중...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> 주문하기
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* 영수증 뷰 */}
      {cartView === "receipt" && (
        <div className="flex-1 overflow-y-auto py-5 px-3 [&::-webkit-scrollbar]:hidden">
          {/* 빈 상태 색이 gray-600(#4b5563)이면 이 패널 배경(#1f2937) 위에서 거의
              안 읽힌다. 데스크톱에선 우측 열 구석이지만 시트에선 화면 한복판이다. */}
          {orderCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Receipt className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">아직 주문 내역이 없습니다</p>
            </div>
          ) : (
            <div className="bg-[#111827] rounded-xl border border-white/10 overflow-hidden">
              <div className="text-center px-4 pt-5 pb-4 border-b border-dashed border-white/20">
                <p className="text-gray-500 text-[10px] tracking-[0.3em] mb-2">
                  영 수 증
                </p>
                <p className="text-white text-lg font-bold">
                  테이블 {tableNumber}번
                </p>
                {receiptTime && (
                  <p className="text-gray-500 text-[10px] mt-1">{receiptTime}</p>
                )}
              </div>
              <div className="px-4 py-3 border-b border-dashed border-white/20 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-600 pb-2 border-b border-white/10">
                  <span>메뉴</span>
                  <span>금액</span>
                </div>
                {receiptItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-baseline text-xs"
                  >
                    <div className="flex items-baseline gap-1 min-w-0 mr-2">
                      <span className="text-white truncate">{item.name}</span>
                      <span className="text-gray-500 shrink-0">
                        ×{item.quantity}
                      </span>
                    </div>
                    <span className="text-orange-400 tabular-nums shrink-0">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-4 flex justify-between items-center">
                <span className="text-white font-bold text-xs tracking-widest">
                  합 계
                </span>
                <span className="text-orange-400 text-base font-bold tabular-nums">
                  {grandTotal.toLocaleString()}원
                </span>
              </div>
              <div className="text-center py-3 border-t border-dashed border-white/20">
                <p className="text-gray-600 text-[10px] tracking-[0.2em]">
                  감사합니다
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

type CartSheetProps = CartPanelProps & {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /**
   * fly-to-cart 도착점(모바일). 하단 바가 md 미만에서 유일하게 보이는 장바구니 표면이다.
   * 버튼 전체가 아니라 아이콘 + `총 N개`만 감싸는 요소에 붙인다 — 버튼(폭 250px) 중심은
   * 개수와 금액 사이의 빈 공간이라, 썸네일이 아무것도 없는 곳에 떨어지고 펌프는
   * 60~100px 왼쪽에서 터진다. 데스크톱에서 성립하던 "도착 → 펌프"의 인과가 끊긴다.
   */
  barRef?: Ref<HTMLSpanElement>;
};

/**
 * md 미만 전용 장바구니 표면 — 고정 하단 바 + 탭하면 올라오는 시트.
 *
 * 라이브러리(vaul)를 쓰지 않은 이유: ui/에 Sheet·Drawer가 없고 dialog.tsx는 중앙 모달
 * 고정이라 재사용이 안 된다. vaul은 package.json에만 있고 import 0건인 잔재인데,
 * body scroll-lock이 이 화면 루트의 `h-screen overflow-hidden`과 어떻게 맞물리는지
 * 미확인이다. 애초에 이 화면은 페이지가 스크롤되지 않아 scroll-lock 자체가 필요 없다.
 *
 * **반드시 루트(`h-screen` div)의 직계 자식으로 렌더할 것.**
 * 하단 바는 루트 flex-col의 마지막 행이 되어 메뉴 영역을 침범하지 않고,
 * 시트의 `fixed`는 transform을 가진 조상이 없어야 뷰포트 기준으로 잡힌다
 * (메뉴 탭 컨테이너는 `animate-in`이 걸려 있어 애니메이션 중 transform이 생긴다).
 */
export default function CartSheet({
  open,
  onOpen,
  onClose,
  barRef,
  ...panel
}: CartSheetProps) {
  return (
    <>
      {/*
        하단 바는 totalItems와 무관하게 항상 마운트한다.
        "담은 게 있을 때만" 띄우면 첫 담기 순간 비행 도착점이 존재하지 않아
        썸네일이 (0,0)으로 날아간다. 배지를 목표로 삼았다가 같은 문제를 겪은 적이 있다.
      */}
      <div className="md:hidden shrink-0 flex items-center gap-3 px-4 py-3 bg-[#1f2937] border-t border-white/10">
        <button
          onClick={onOpen}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/10 transition-colors"
        >
          {/* 비행 도착점. 배지 펌프가 터지는 `총 N개`를 포함하는 최소 단위라야
              도착과 펌프가 같은 자리에서 일어난다. 담은 게 없어도 항상 렌더된다 —
              첫 담기 시점에 목표가 없으면 썸네일이 (0,0)으로 날아간다. */}
          <span ref={barRef} className="flex items-center gap-2 shrink-0">
            <ShoppingCart className="w-4 h-4 text-orange-400 shrink-0" />
            <span
              key={panel.badgePulseKey}
              className="animate-in zoom-in-50 duration-200 text-sm text-gray-300 shrink-0"
            >
              총 {panel.totalItems}개
            </span>
          </span>
          <span className="ml-auto text-white font-bold tabular-nums truncate">
            {panel.totalAmount.toLocaleString()}원
          </span>
          <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
        </button>
        {/* 담긴 게 없을 때는 "눌러도 안 되는 회색 버튼"이 첫 화면부터 상주하는 대신
            무엇을 해야 하는지 알려준다. 바의 폭·높이는 버튼과 동일하게 유지해야 한다
            — 이 바가 fly-to-cart 도착점이라 치수가 흔들리면 착지 지점이 움직인다. */}
        {panel.cart.length === 0 ? (
          <span className="shrink-0 min-w-[92px] px-5 py-3 text-sm text-gray-500 flex items-center justify-center">
            메뉴를 담아주세요
          </span>
        ) : (
          <button
            onClick={panel.onSubmit}
            disabled={panel.isSubmitting}
            className="shrink-0 min-w-[92px] px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/60 text-white text-sm font-semibold flex items-center justify-center transition-colors"
          >
            {panel.isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "주문하기"
            )}
          </button>
        )}
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* 스크림. 완료 모달(z-50)과 같은 톤을 쓰되 그 아래에 깔린다 */}
          <button
            type="button"
            aria-label="장바구니 닫기"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 animate-in fade-in duration-200"
          />
          {/* DESIGN.md: 깊이감은 그림자가 아니라 배경 레이어 단계로만 표현한다 → shadow 없음 */}
          {/* 포커스 트랩이 없으므로 aria-modal은 붙이지 않는다 — 실제로 못 지키는 약속이다.
              스크림 버튼과 X 버튼 두 곳으로 닫을 수 있다. */}
          <div
            role="dialog"
            aria-label="장바구니"
            className="relative h-[70%] flex flex-col bg-[#1f2937] border-t border-white/10 rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* 그래버 막대를 두지 않는다. 끌어 닫기를 암시해놓고 스와이프 구현이
                없으면 지키지 못할 약속이 된다. 닫는 경로는 X와 스크림 두 개다. */}
            <div className="relative shrink-0 pt-3 pb-1">
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="absolute right-1 -top-1 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <CartPanel {...panel} />
          </div>
        </div>
      )}
    </>
  );
}
