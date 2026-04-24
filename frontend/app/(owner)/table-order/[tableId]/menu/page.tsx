"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CartItem, MenuItem } from "@/types/types";
import Image from "next/image";

export default function Page() {
  const { tableId } = useParams<{ tableId: string }>();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/menu`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMenus(data));
  }, []);

  const categories = ["전체", ...new Set(menus.map((m) => m.category))];
  const availableMenus = menus.filter((m) => m.available);
  const grouped = categories
    .filter((c) => c !== "전체")
    .map((cat) => ({
      category: cat,
      items: availableMenus.filter((m) => m.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
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

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-[#111827] text-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 bg-[#1f2937] border-b border-white/10">
        <h2 className="text-white m-0 text-lg font-semibold">테이블 주문</h2>
        <p className="text-sm text-gray-400 mt-1">메뉴를 선택해주세요</p>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left category sidebar */}
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

        {/* Menu content */}
        <main className="flex-1 overflow-y-auto px-6 py-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="w-full h-full object-cover"
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
      </div>

      {/* FAB 버튼 */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors z-40"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-orange-500 text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        </button>
      )}

      {/* 백드롭 */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsCartOpen(false)} />
      )}

      {/* 장바구니 사이드바 */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#1f2937] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg m-0">장바구니</h3>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">담긴 메뉴가 없습니다</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={44} height={44} className="w-11 h-11 rounded-lg object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#374151] flex items-center justify-center">🍽️</div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.price.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => addToCart(menus.find((m) => m.id === item.id)!)} className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm">총 {totalItems}개</span>
            <span className="text-white font-bold text-xl">{totalAmount.toLocaleString()}원</span>
          </div>
          <button
            onClick={async () => {
              await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tableId,
                  items: cart.map((item) => ({ menuItemId: item.id, name: item.name, price: item.price, quantity: item.quantity })),
                }),
              });
              setCart([]);
              setIsCartOpen(false);
              alert("주문이 완료되었습니다!");
            }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> 주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
