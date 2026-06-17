"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Plus, Minus, Bell, CheckCircle, Receipt } from "lucide-react";
import { CartItem, MenuItem } from "@/types/types";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

type Tab = "menu" | "service";

type TableOrder = {
  id: string;
  status: string;
  createdAt: string;
  orderItems: { name: string; price: number; quantity: number }[];
};


export default function Page() {
  const { tableId } = useParams<{ tableId: string }>();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [serviceCart, setServiceCart] = useState<Record<string, number>>({});
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [serviceOrdered, setServiceOrdered] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [cartView, setCartView] = useState<"cart" | "receipt">("cart");
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);

  const { data: tableOrders = [], refetch: refetchOrders } = useQuery<TableOrder[]>({
    queryKey: ["table-orders", tableId],
    queryFn: async () => {
      const res = await apiFetch(`/orders?tableId=${tableId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: allTables = [] } = useQuery<{ id: string; number: number }[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await apiFetch("/tables");
      if (!res.ok) return [];
      return res.json();
    },
  });
  const tableNumber = allTables.find((t) => t.id === tableId)?.number ?? "-";

  const receiptItems = useMemo(() => {
    const map = new Map<string, { name: string; price: number; quantity: number }>();
    tableOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const existing = map.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          map.set(item.name, { name: item.name, price: item.price, quantity: item.quantity });
        }
      });
    });
    return Array.from(map.values());
  }, [tableOrders]);

  const grandTotal = receiptItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const receiptTime = tableOrders.length > 0
    ? new Date(tableOrders[0].createdAt).toLocaleString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  useEffect(() => {
    if (!showOrderModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); setShowOrderModal(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showOrderModal]);

  useEffect(() => {
    apiFetch("/menu")
      .then((res) => res.json())
      .then((data) => setMenus(data));
  }, []);

  const serviceMenus = menus.filter((m) => m.available && m.type === "SERVICE");

  const { categories, grouped } = useMemo(() => {
    const orderMenus = menus.filter((m) => m.available && m.type !== "SERVICE");
    const cats = ["전체", ...Array.from(new Set(orderMenus.map((m) => m.category)))];
    const grp = cats
      .filter((c) => c !== "전체")
      .map((cat) => ({ category: cat, items: orderMenus.filter((m) => m.category === cat) }))
      .filter((g) => g.items.length > 0);
    return { categories: cats, grouped: grp };
  }, [menus]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    isScrollingRef.current = true;
    setTimeout(() => { isScrollingRef.current = false; }, 600);
    if (category === "전체") {
      document.getElementById("menu-top")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    document.getElementById(`cat-${category}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing)
        return prev.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      return [...prev, { id: menu.id, name: menu.name, price: menu.price, quantity: 1, image: menu.image }];
    });
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

  const updateServiceQty = (menuId: string, delta: number) => {
    setServiceCart((prev) => {
      const next = Math.max(0, (prev[menuId] ?? 0) + delta);
      return { ...prev, [menuId]: next };
    });
  };

  const submitServiceOrder = async () => {
    const items = serviceMenus
      .filter((m) => (serviceCart[m.id] ?? 0) > 0)
      .map((m) => ({ menuItemId: m.id, name: m.name, price: m.price, quantity: serviceCart[m.id] }));
    if (items.length === 0) return;
    setIsServiceSubmitting(true);
    try {
      await apiFetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items }),
      });
      setServiceCart({});
      setServiceOrdered(true);
      setTimeout(() => setServiceOrdered(false), 2000);
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
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveCategory(top.target.id.replace("cat-", ""));
      },
      { root: mainRef.current, rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    grouped.forEach(({ category }) => {
      const el = document.getElementById(`cat-${category}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [grouped]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-[#111827] text-white overflow-hidden">
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
          onClick={() => setActiveTab("service")}
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
        <div className="flex flex-1 overflow-hidden">
          {/* 카테고리 사이드바 */}
          <aside className="w-24 shrink-0 bg-[#1a2232] flex flex-col items-center py-4 gap-2 overflow-y-auto border-r border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`w-16 py-3 rounded-xl text-sm font-medium transition-colors text-center ${
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
          <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div id="menu-top" />
            {grouped.map(({ category, items }) => (
              <section key={category} id={`cat-${category}`} className="mb-10">
                <h3 className="text-white text-base font-semibold mb-4 pb-2 border-b border-white/10">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-[#1f2937] rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all"
                    >
                      <div className="aspect-square bg-[#374151] flex items-center justify-center overflow-hidden">
                        {menu.image ? (
                          <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">🍽️</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-white text-sm line-clamp-1">{menu.name}</p>
                        <p className="text-orange-400 text-sm mt-1">{menu.price.toLocaleString()}원</p>
                        <button
                          onClick={() => addToCart(menu)}
                          className="mt-2 w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> 담기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>

          {/* 장바구니 / 주문 내역 패널 */}
          <aside className="w-1/4 shrink-0 bg-[#1f2937] border-l border-white/10 flex flex-col">
            {/* 토글 태그 */}
            <div className="px-4 py-3 border-b border-white/10 flex gap-2">
              <button
                onClick={() => setCartView("cart")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  cartView === "cart" ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                장바구니
                {totalItems > 0 && (
                  <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none ${
                    cartView === "cart" ? "bg-white/25" : "bg-orange-500 text-white"
                  }`}>
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCartView("receipt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  cartView === "receipt" ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                주문 내역
                {tableOrders.length > 0 && (
                  <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none ${
                    cartView === "receipt" ? "bg-white/25" : "bg-orange-500 text-white"
                  }`}>
                    {tableOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* 장바구니 뷰 */}
            {cartView === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:hidden">
                  {cart.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10 text-sm">담긴 메뉴가 없습니다</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#374151] flex items-center justify-center shrink-0">🍽️</div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.price.toLocaleString()}원</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => addToCart(menus.find((m) => m.id === item.id)!)} className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-6 py-5 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">총 {totalItems}개</span>
                    <span className="text-white font-bold text-lg">{totalAmount.toLocaleString()}원</span>
                  </div>
                  <button
                    disabled={cart.length === 0}
                    onClick={async () => {
                      await apiFetch("/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          tableId,
                          items: cart.map((item) => ({ menuItemId: item.id, name: item.name, price: item.price, quantity: item.quantity })),
                        }),
                      });
                      setCart([]);
                      setCountdown(10);
                      setShowOrderModal(true);
                      void refetchOrders();
                    }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-gray-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" /> 주문하기
                  </button>
                </div>
              </>
            )}

            {/* 영수증 뷰 */}
            {cartView === "receipt" && (
              <div className="flex-1 overflow-y-auto py-5 px-3 [&::-webkit-scrollbar]:hidden">
                {tableOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <Receipt className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs">아직 주문 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="bg-[#111827] rounded-xl border border-white/10 overflow-hidden">
                    <div className="text-center px-4 pt-5 pb-4 border-b border-dashed border-white/20">
                      <p className="text-gray-500 text-[10px] tracking-[0.3em] mb-2">영 수 증</p>
                      <p className="text-white text-lg font-bold">테이블 {tableNumber}번</p>
                      {receiptTime && <p className="text-gray-500 text-[10px] mt-1">{receiptTime}</p>}
                    </div>
                    <div className="px-4 py-3 border-b border-dashed border-white/20 space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-600 pb-2 border-b border-white/10">
                        <span>메뉴</span>
                        <span>금액</span>
                      </div>
                      {receiptItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-baseline text-xs">
                          <div className="flex items-baseline gap-1 min-w-0 mr-2">
                            <span className="text-white truncate">{item.name}</span>
                            <span className="text-gray-500 shrink-0">×{item.quantity}</span>
                          </div>
                          <span className="text-orange-400 tabular-nums shrink-0">
                            {(item.price * item.quantity).toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-4 flex justify-between items-center">
                      <span className="text-white font-bold text-xs tracking-widest">합  계</span>
                      <span className="text-orange-400 text-base font-bold tabular-nums">
                        {grandTotal.toLocaleString()}원
                      </span>
                    </div>
                    <div className="text-center py-3 border-t border-dashed border-white/20">
                      <p className="text-gray-600 text-[10px] tracking-[0.2em]">감사합니다</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* 직원 호출 탭 */}
      {activeTab === "service" && (
        <div className="flex-1 flex flex-col overflow-hidden">
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
                        <Bell className={`w-7 h-7 ${qty > 0 ? "text-orange-400" : "text-gray-500"}`} />
                        <span className="text-sm font-semibold text-white text-center">{menu.name}</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateServiceQty(menu.id, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-bold text-white w-6 text-center">{qty}</span>
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
                  disabled={isServiceSubmitting || Object.values(serviceCart).every((q) => q === 0) || serviceOrdered}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    serviceOrdered
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-gray-600 text-white"
                  }`}
                >
                  {serviceOrdered ? (
                    <><CheckCircle className="w-4 h-4" /> 요청 완료!</>
                  ) : isServiceSubmitting ? (
                    "처리 중..."
                  ) : (
                    <><Bell className="w-4 h-4" /> 주문</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 주문 완료 모달 */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl px-10 py-10 flex flex-col items-center gap-4 shadow-2xl">
            <CheckCircle className="w-16 h-16 text-green-400" />
            <p className="text-white text-xl font-bold">주문이 완료되었습니다!</p>
            <p className="text-gray-400 text-sm">{countdown}초 후 자동으로 닫힙니다</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => { setShowOrderModal(false); setCartView("receipt"); }}
                className="px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                주문 내역
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
