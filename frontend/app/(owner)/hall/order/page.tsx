"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { AdminMenuItem } from "@/types/types";

type Table = { id: string; number: number };
type CartItem = { id: string; name: string; price: number; quantity: number };

export default function Page() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [menus, setMenus] = useState<AdminMenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [tRes, mRes] = await Promise.all([
        apiFetch("/tables"),
        apiFetch("/menu"),
      ]);
      if (tRes.ok) {
        const data: Table[] = await tRes.json();
        setTables(data);
        if (data.length > 0) setSelectedTableId(data[0].id);
      }
      if (mRes.ok) setMenus(await mRes.json());
    };
    void load();
  }, []);

  const categories = ["전체", ...Array.from(new Set(menus.map((m) => m.category)))];
  const filtered = menus.filter(
    (m) => m.available && (selectedCategory === "전체" || m.category === selectedCategory),
  );

  const addToCart = (menu: AdminMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === menu.id);
      if (existing) return prev.map((i) => i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: menu.id, name: menu.name, price: menu.price, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const next = i.quantity + delta;
        return next <= 0 ? [] : [{ ...i, quantity: next }];
      }),
    );
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedTableId || cart.length === 0) return;
    setIsSubmitting(true);
    const res = await apiFetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: selectedTableId,
        items: cart.map((i) => ({
          menuItemId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      }),
    });
    setIsSubmitting(false);
    if (res.ok) router.push("/hall/orders");
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#1f2937] border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hall/orders" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-white">주문 입력</h1>
          </div>

          {/* 테이블 선택 드롭다운 */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">테이블</label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-[#111827] border border-white/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  테이블 {t.number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex gap-6 p-6 min-h-0">
        {/* 메뉴 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-white/20 text-gray-400 hover:text-white hover:border-white/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 메뉴 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {filtered.map((menu) => {
              const cartItem = cart.find((i) => i.id === menu.id);
              return (
                <button
                  key={menu.id}
                  onClick={() => addToCart(menu)}
                  className="bg-[#1f2937] border border-white/10 rounded-xl p-4 text-left hover:border-orange-500/50 transition-colors relative"
                >
                  {cartItem && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartItem.quantity}
                    </span>
                  )}
                  <p className="text-sm font-medium text-white mb-1 pr-6">{menu.name}</p>
                  <p className="text-xs text-gray-500">{menu.category}</p>
                  <p className="text-sm font-semibold text-orange-400 mt-2">
                    {menu.price.toLocaleString()}원
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 장바구니 */}
        <div className="w-72 flex-shrink-0 bg-[#1f2937] rounded-xl border border-white/10 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-white">장바구니</span>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="ml-auto text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden">
            {cart.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-8">메뉴를 선택하세요</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm text-gray-200 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{(item.price * item.quantity).toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-400">합계</span>
              <span className="font-semibold text-white">{totalAmount.toLocaleString()}원</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedTableId || cart.length === 0 || isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-gray-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {isSubmitting ? "처리 중..." : "주문 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
