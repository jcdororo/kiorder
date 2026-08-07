"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Minus, Bell, CheckCircle, Receipt } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { CartItem } from "@/types/order";
import { apiFetch, readErrorMessage } from "@/lib/api";
import Image from "next/image";
import { useTableMenu } from "@/hooks/useTableMenu";
import { useFlyToCart } from "@/hooks/useFlyToCart";
import FlyingThumb from "@/components/table-order/FlyingThumb";
import { Screensaver } from "@/components/screensaver/Screensaver";
import CartSheet, {
  CartPanel,
  type CartView,
} from "@/components/table-order/CartSheet";

type Tab = "menu" | "service";

export default function Page() {
  const { tableId } = useParams<{ tableId: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [serviceCart, setServiceCart] = useState<Record<string, number>>({});
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [serviceOrdered, setServiceOrdered] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [cartView, setCartView] = useState<CartView>("cart");
  // cartView가 "무엇을 보여줄지", isCartOpen이 "표면을 띄울지"다. 둘은 직교한다.
  // md 이상에서는 패널이 항상 열린 열이라 isCartOpen을 아예 읽지 않는다
  // → 이 state가 어떤 값이든 데스크톱 동작은 변하지 않는다.
  const [isCartOpen, setIsCartOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);
  // md 미만에서 카테고리 레일이 가로 칩 줄이 된다. 세로 레일과 달리 활성 칩이
  // 스크롤 밖으로 밀려날 수 있어, 활성 항목을 시야로 끌어오기 위한 ref 맵.
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // 비행 도착점. 배지는 totalItems > 0일 때만 렌더되어 첫 담기 시점에 존재하지 않으므로,
  // 항상 존재하는 장바구니 탭 버튼(데스크톱) / 하단 바(모바일)를 목표로 삼는다.
  const cartTabRef = useRef<HTMLButtonElement>(null);
  // 모바일 목표는 하단 바 버튼 전체가 아니라 아이콘 + `총 N개`를 감싼 span이다.
  // 버튼 중심(폭 250px)은 개수와 금액 사이의 빈 공간이라 착지 지점과 펌프가 어긋난다.
  const cartBarRef = useRef<HTMLSpanElement>(null);
  const { flights, fly, done } = useFlyToCart();
  // 배지 펌프를 담기 시점이 아니라 "비행체가 도착한 시점"에 터뜨리기 위한 카운터.
  // totalItems를 key로 쓰면 비행체가 아직 출발 카드 위에 있을 때 이미 펌프가 끝나
  // 두 연출이 인과로 읽히지 않는다(UX 검증에서 162ms 프레임으로 확인됨).
  const [landed, setLanded] = useState(0);

  const handleFlightDone = (id: number) => {
    done(id);
    setLanded((n) => n + 1);
  };

  // 이전에는 onClick에서 직접 await 하느라 진행 중 상태가 없었다.
  // 응답이 오기 전에 다시 누르면 같은 주문이 그대로 한 번 더 들어갔다(실사용 QA에서 발견).
  // useMutation으로 바꿔 isPending으로 버튼을 잠그고, 프로젝트의 React Query 컨벤션에도 맞춘다.
  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          items: cart.map((item) => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });
      if (!res.ok) {
        throw new Error(
          await readErrorMessage(
            res,
            `주문 전송에 실패했습니다 (${res.status})`,
          ),
        );
      }
    },
    onSuccess: () => {
      setCart([]);
      setCountdown(10);
      // 시트에서 주문했다면 완료 모달 뒤에 빈 장바구니가 남는다. 모달에 자리를 넘긴다.
      setIsCartOpen(false);
      setShowOrderModal(true);
      void refetchOrders();
    },
    onError: (error: Error) =>
      toast.error(error.message || "주문에 실패했습니다"),
  });

  const {
    menus,
    serviceMenus,
    categories,
    grouped,
    tableNumber,
    tableOrders,
    refetchOrders,
    receiptItems,
    grandTotal,
    receiptTime,
  } = useTableMenu(tableId);

  useEffect(() => {
    if (!showOrderModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowOrderModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showOrderModal]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    isScrollingRef.current = true;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
    if (category === "전체") {
      document
        .getElementById("menu-top")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    document
      .getElementById(`cat-${category}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing)
        return prev.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      return [
        ...prev,
        {
          id: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          image: menu.image,
        },
      ];
    });
  };

  // 장바구니 표면이 브레이크포인트마다 다르다. 두 후보가 동시에 DOM에 있고
  // 한쪽은 display:none이라 getBoundingClientRect()가 전부 0으로 나온다.
  // 0인 rect를 그대로 목표로 삼으면 썸네일이 화면 좌상단(0,0)으로 날아가므로,
  // "지금 실제로 크기를 가진" 쪽을 고른다. 등록 시점이 아니라 호출 시점에 판정하므로
  // 브라우저 창을 브레이크포인트 너머로 리사이즈해도 목표가 어긋나지 않는다.
  const visibleCartRect = () => {
    for (const el of [cartBarRef.current, cartTabRef.current]) {
      const rect = el?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) return rect;
    }
    return null;
  };

  // 메뉴 카드에서만 호출한다. 장바구니 안의 + 버튼은 이미 목적지에 있으므로 날릴 필요가 없다.
  // 호출부가 카드 전체(button)라 HTMLElement로 받는다. closest가 자기 자신도
  // 매치하므로 카드가 currentTarget이어도 썸네일 좌표는 그대로 찾는다.
  const addFromCard = (e: React.MouseEvent<HTMLElement>, menu: MenuItem) => {
    addToCart(menu); // 상태는 즉시 반영한다. 애니메이션은 순수 장식이라 조작을 지연시키지 않는다.
    const thumb = e.currentTarget
      .closest("[data-menu-card]")
      ?.querySelector("[data-menu-thumb]");
    const target = visibleCartRect();
    const flew =
      thumb && target
        ? fly(thumb.getBoundingClientRect(), target, menu.image)
        : false;
    // 모션 최소화 설정이거나 좌표를 못 얻어 비행이 없으면 도착을 기다릴 수 없다.
    // 그 경우엔 배지 펌프를 즉시 발화시켜 피드백이 통째로 사라지지 않게 한다.
    if (!flew) setLanded((n) => n + 1);
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menuId);
      if (existing && existing.quantity > 1)
        return prev.map((item) =>
          item.id === menuId ? { ...item, quantity: item.quantity - 1 } : item,
        );
      return prev.filter((item) => item.id !== menuId);
    });
  };

  // 장바구니 안의 + 는 이미 담긴 항목이므로 원본 메뉴를 되찾아 addToCart로 넘긴다.
  // (패널을 컴포넌트로 뽑으면서 menus 배열까지 넘기지 않으려고 페이지에 남긴 어댑터)
  const increaseCartItem = (item: CartItem) =>
    addToCart(menus.find((m) => m.id === item.id)!);

  const updateServiceQty = (menuId: string, delta: number) => {
    setServiceCart((prev) => {
      const next = Math.max(0, (prev[menuId] ?? 0) + delta);
      return { ...prev, [menuId]: next };
    });
  };

  const submitServiceOrder = async () => {
    const items = serviceMenus
      .filter((m) => (serviceCart[m.id] ?? 0) > 0)
      .map((m) => ({
        menuItemId: m.id,
        name: m.name,
        price: m.price,
        quantity: serviceCart[m.id],
      }));
    if (items.length === 0) return;
    setIsServiceSubmitting(true);
    try {
      const res = await apiFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items }),
      });
      // 응답을 확인하지 않아 서버가 거절해도 "요청 완료!"가 떴다.
      // 실패하면 장바구니를 비우지 않고 그대로 두어 손님이 다시 시도할 수 있게 한다.
      if (!res.ok) {
        toast.error(
          await readErrorMessage(
            res,
            `요청 전송에 실패했습니다 (${res.status})`,
          ),
        );
        return;
      }
      setServiceCart({});
      setServiceOrdered(true);
      setTimeout(() => setServiceOrdered(false), 2000);
    } catch {
      // 네트워크 단절 등으로 요청 자체가 실패한 경우
      toast.error("요청 전송에 실패했습니다");
    } finally {
      setIsServiceSubmitting(false);
    }
  };

  useEffect(() => {
    if (!mainRef.current || grouped.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveCategory(top.target.id.replace("cat-", ""));
      },
      { root: mainRef.current, rootMargin: "-10% 0px -80% 0px", threshold: 0 },
    );

    grouped.forEach(({ category }) => {
      const el = document.getElementById(`cat-${category}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [grouped]);

  // 활성 칩을 시야로 끌어온다. 탭으로 바꿨든 스크롤(IntersectionObserver)로 바뀌었든
  // 경로가 같으므로 activeCategory 한 곳만 본다.
  // block: "nearest"가 없으면 세로 축까지 정렬하려 들어 페이지가 튄다.
  // setState가 아닌 DOM 부수효과라 set-state-in-effect 룰 대상이 아니다.
  useEffect(() => {
    // md 이상은 세로 레일이라 원본에 없던 동작이 된다. block: "nearest"가 세로 축에
    // 걸려 카테고리가 많은 매장에서는 스크롤할 때마다 좌측 레일이 스스로 움직인다.
    if (window.matchMedia("(min-width: 768px)").matches) return;
    chipRefs.current[activeCategory]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCategory]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // h-screen(=100vh)은 iOS Safari에서 툴바가 접힌 상태 기준이라 실제 가시 영역보다
  // 60~115px 크다. 하단 바가 루트 flex-col의 마지막 행이고 루트가 overflow-hidden이라,
  // 벗어나면 스크롤로 드러낼 수도 없다 — md 미만에서 장바구니에 도달하는 유일한 경로와
  // 주문하기가 동시에 사라진다. dvh는 툴바가 펼쳐진 현재 높이를 쓴다.
  return (
    <div className="h-dvh flex flex-col bg-[#111827] text-white overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 px-6 py-4 bg-[#1f2937] border-b border-white/10">
        <h2 className="text-white m-0 text-lg font-semibold">테이블 주문</h2>
        <p className="text-sm text-gray-400 mt-1">메뉴를 선택해주세요</p>
      </div>

      {/* 탭 바 */}
      <div className="shrink-0 flex bg-[#1a2232] border-b border-white/10">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "menu"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          메뉴 주문
        </button>
        <button
          // 시트가 열린 채 탭이 바뀌면 CartSheet는 언마운트되지만 isCartOpen은 true로
          // 남아, 메뉴 탭으로 돌아왔을 때 시트가 열린 채 다시 뜬다. 스크림은 포인터만
          // 막고 이 버튼은 여전히 포커스 가능해서 키보드로 실제 도달하는 경로다.
          onClick={() => {
            setActiveTab("service");
            setIsCartOpen(false);
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "service"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          직원 호출
        </button>
      </div>

      {/* 메뉴 주문 탭 */}
      {activeTab === "menu" && (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden animate-in fade-in duration-200">
          {/* 카테고리 사이드바 (md 미만에서는 가로 스크롤 칩 줄) */}
          <aside className="w-full md:w-24 shrink-0 bg-[#1a2232] flex flex-row md:flex-col items-center px-4 py-2 md:px-0 md:py-4 gap-2 overflow-x-auto overflow-y-hidden md:overflow-y-auto max-md:[&::-webkit-scrollbar]:hidden max-md:[scrollbar-width:none] border-b md:border-b-0 md:border-r border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                ref={(el) => {
                  chipRefs.current[cat] = el;
                }}
                onClick={() => scrollToCategory(cat)}
                className={`shrink-0 md:shrink w-auto md:w-16 px-4 md:px-0 py-2 md:py-3 max-md:whitespace-nowrap rounded-xl text-sm font-medium transition-colors text-center ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </aside>

          {/* 메뉴 콘텐츠 */}
          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto px-6 py-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div id="menu-top" />
            {grouped.map(({ category, items }) => (
              <section key={category} id={`cat-${category}`} className="mb-10">
                <h3 className="text-white text-base font-semibold mb-4 pb-2 border-b border-white/10">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((menu) => (
                    // 담기 버튼만으로는 히트 영역이 작아 카드 전체를 누를 수 있게 한다.
                    // div + onClick이 아니라 button인 이유: 키보드 도달·스크린리더
                    // 역할·누른 상태가 전부 따라온다. 대신 안쪽 담기는 span이어야 한다
                    // (버튼 안 버튼은 HTML에서 금지).
                    <button
                      key={menu.id}
                      type="button"
                      data-menu-card
                      onClick={(e) => addFromCard(e, menu)}
                      aria-label={`${menu.name} ${menu.price.toLocaleString()}원 담기`}
                      className="group block w-full text-left bg-[#1f2937] rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 active:scale-[0.98] transition-all duration-150"
                    >
                      <div
                        data-menu-thumb
                        className="relative aspect-square bg-[#374151] flex items-center justify-center overflow-hidden"
                      >
                        {menu.image ? (
                          <Image
                            src={menu.image}
                            alt={menu.name}
                            fill
                            // FlyingThumb와 동일해야 /_next/image URL이 일치해 캐시가 재사용된다.
                            sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 18vw"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-4xl">🍽️</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-white text-sm line-clamp-1">
                          {menu.name}
                        </p>
                        <p className="text-orange-400 text-sm mt-1">
                          {menu.price.toLocaleString()}원
                        </p>
                        {/* 카드가 버튼이 됐으므로 이건 더 이상 버튼이 아니다.
                            어포던스는 남기되 hover는 카드 전체에 반응해야 하므로
                            group-hover를 쓴다(전에는 이 요소 위에서만 색이 바뀌었다). */}
                        <span className="mt-2 w-full py-1.5 bg-orange-500 group-hover:bg-orange-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors duration-150">
                          <Plus className="w-3.5 h-3.5" /> 담기
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </main>

          {/* 장바구니 / 주문 내역 패널 (md 이상 전용. md 미만은 하단 바 + 시트) */}
          <aside className="hidden md:flex md:w-1/4 shrink-0 bg-[#1f2937] md:border-l border-white/10 flex-col">
            <CartPanel
              cartView={cartView}
              onChangeView={setCartView}
              cartTabRef={cartTabRef}
              cart={cart}
              totalItems={totalItems}
              totalAmount={totalAmount}
              badgePulseKey={landed}
              onIncrease={increaseCartItem}
              onDecrease={removeFromCart}
              onSubmit={() => orderMutation.mutate()}
              isSubmitting={orderMutation.isPending}
              orderCount={tableOrders.length}
              receiptItems={receiptItems}
              grandTotal={grandTotal}
              tableNumber={tableNumber}
              receiptTime={receiptTime}
            />
          </aside>
        </div>
      )}

      {/* md 미만 장바구니 표면. 루트의 직계 자식이라야 한다 —
          하단 바가 루트 flex-col의 마지막 행이 되어 메뉴 영역을 밀지 않고,
          시트의 fixed가 transform 조상 없이 뷰포트 기준으로 잡힌다.
          md 이상에서는 통째로 display:none이라 820은 이 블록의 영향을 받지 않는다. */}
      {activeTab === "menu" && (
        <CartSheet
          open={isCartOpen}
          // 하단 바는 "총 N개 · 금액"을 보여주는 장바구니 어포던스인데 마지막에 보던
          // 뷰가 유지되면 주문 1회차 뒤 재담기에서 영수증이 뜬다. 완료 모달의
          // "주문 내역"은 cartView를 직접 receipt로 바꾸므로 그 경로는 영향받지 않는다.
          onOpen={() => {
            setCartView("cart");
            setIsCartOpen(true);
          }}
          onClose={() => setIsCartOpen(false)}
          barRef={cartBarRef}
          cartView={cartView}
          onChangeView={setCartView}
          cart={cart}
          totalItems={totalItems}
          totalAmount={totalAmount}
          badgePulseKey={landed}
          onIncrease={increaseCartItem}
          onDecrease={removeFromCart}
          onSubmit={() => orderMutation.mutate()}
          isSubmitting={orderMutation.isPending}
          orderCount={tableOrders.length}
          receiptItems={receiptItems}
          grandTotal={grandTotal}
          tableNumber={tableNumber}
          receiptTime={receiptTime}
        />
      )}

      {/* 직원 호출 탭 */}
      {activeTab === "service" && (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {serviceMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-600">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">등록된 직원호출 메뉴가 없습니다</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden">
                <p className="text-center text-gray-400 text-sm mb-6">
                  필요한 수량을 선택한 뒤 주문 버튼을 눌러주세요
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {serviceMenus.map((menu) => {
                    const qty = serviceCart[menu.id] ?? 0;
                    return (
                      <div
                        key={menu.id}
                        className={`flex flex-col items-center gap-4 py-6 px-4 rounded-2xl border-2 transition-all ${
                          qty > 0
                            ? "bg-orange-500/10 border-orange-500/40"
                            : "bg-[#1f2937] border-white/10"
                        }`}
                      >
                        <Bell
                          className={`w-7 h-7 ${qty > 0 ? "text-orange-400" : "text-gray-500"}`}
                        />
                        <span className="text-sm font-semibold text-white text-center">
                          {menu.name}
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateServiceQty(menu.id, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-bold text-white w-6 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateServiceQty(menu.id, 1)}
                            className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 하단 주문 버튼 */}
              <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-[#111827]">
                <button
                  onClick={submitServiceOrder}
                  disabled={
                    isServiceSubmitting ||
                    Object.values(serviceCart).every((q) => q === 0) ||
                    serviceOrdered
                  }
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    serviceOrdered
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-gray-600 text-white"
                  }`}
                >
                  {serviceOrdered ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> 요청 완료!
                    </>
                  ) : isServiceSubmitting ? (
                    "처리 중..."
                  ) : (
                    <>
                      <Bell className="w-4 h-4" /> 주문
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 장바구니로 날아가는 썸네일. position:fixed라 트리 위치와 무관하지만,
          장바구니 리스트의 overflow-y-auto에 잘리지 않도록 패널 밖에 둔다. */}
      {flights.map((flight) => (
        <FlyingThumb key={flight.id} flight={flight} onDone={handleFlightDone} />
      ))}

      {/* 주문 완료 모달 */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl px-10 py-10 flex flex-col items-center gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle className="w-16 h-16 text-green-400" />
            <p className="text-white text-xl font-bold">
              주문이 완료되었습니다!
            </p>
            <p className="text-gray-400 text-sm">
              {countdown}초 후 자동으로 닫힙니다
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setCartView("receipt");
                  // md 미만에서는 영수증이 시트 안에 있다. 뷰만 바꾸면
                  // 아무 반응 없는 버튼이 된다. md 이상에서는 무시되는 state다.
                  setIsCartOpen(true);
                }}
                className="px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                주문 내역
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 화면보호기. 오버레이일 뿐 이 페이지를 언마운트하지 않으므로
          cart·activeCategory·스크롤 위치가 그대로 남는다 — 손님이 자리를 비웠다
          돌아왔을 때 담아둔 걸 잃지 않는 게 이 화면의 전제다.
          z-[60]: 완료 모달·FlyingThumb과 같은 z-50에 두면 DOM 순서에 승패가 걸린다. */}
      <Screensaver
        idleMs={180_000}
        enabled={!orderMutation.isPending && !showOrderModal}
        footerNote={
          totalItems > 0 ? `담아두신 ${totalItems}개는 그대로 있습니다` : undefined
        }
        className="fixed z-[60]"
      />
    </div>
  );
}
