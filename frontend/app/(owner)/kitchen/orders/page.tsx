"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackendOrder, KitchenOrder } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import OrderCard from "@/components/kitchen/OrderCard";

const STATUS_LIST: KitchenOrder["status"][] = ["접수됨", "조리중", "완료"];

const COLUMN_BADGE: Record<KitchenOrder["status"], string> = {
  접수됨: "bg-white/10 text-gray-300 border border-white/20",
  조리중: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  완료:   "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await apiFetch("/orders");
    if (!res.ok) return;
    const data = await res.json();
    setOrders(
      data.map((o: BackendOrder) => ({
        id: o.id,
        tableNumber: o.table.number,
        orderNumber: `#${o.id.slice(-6).toUpperCase()}`,
        status: o.status as KitchenOrder["status"],
        items: o.orderItems.map((i) => ({ name: i.name, quantity: i.quantity })),
        receivedAt: o.createdAt,
        startedAt: o.startedAt ?? undefined,
        completedAt: o.completedAt ?? undefined,
      })),
    );
  }, []);

  useEffect(() => {
    void (async () => { await fetchOrders(); })();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: KitchenOrder["status"],
  ) => {
    setLoadingId(orderId);
    await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchOrders();
    setLoadingId(null);
  };

  const ordersByStatus = {
    접수됨: orders.filter((o) => o.status === "접수됨"),
    조리중: orders.filter((o) => o.status === "조리중"),
    완료:   orders.filter((o) => o.status === "완료"),
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* 헤더 */}
      <div className="bg-[#1f2937] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">주방 화면</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {currentTime?.toLocaleTimeString("ko-KR") ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">실시간 연결됨</span>
          </div>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_LIST.map((status) => (
            <div key={status}>
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">{status}</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${COLUMN_BADGE[status]}`}>
                  {ordersByStatus[status].length}
                </span>
              </div>

              {/* 카드 목록 */}
              <div className="space-y-3">
                {ordersByStatus[status].map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    status={status}
                    currentTime={currentTime}
                    isLoading={loadingId === order.id}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {ordersByStatus[status].length === 0 && (
                  <div className="text-center py-10 text-gray-600 text-sm border border-dashed border-white/10 rounded-xl">
                    없음
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
