"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { BackendOrder, HallOrder } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import OrderCard from "@/components/hall/OrderCard";
import { useQuery, useMutation } from "@tanstack/react-query";

const STATUS_LIST: HallOrder["status"][] = ["접수됨", "조리중", "완료"];

const COLUMN_BADGE: Record<HallOrder["status"], string> = {
  접수됨: "bg-white/10 text-gray-300 border border-white/20",
  조리중: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  완료:   "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const { data: storeData } = useQuery<{ id: string; name: string } | null>({
    queryKey: ["store", "my"],
    queryFn: async () => {
      const res = await apiFetch("/stores/my");
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
  });
  const storeId = storeData?.id ?? null;

  const { data: orders = [], refetch: refetchOrders } = useQuery<HallOrder[]>({
    queryKey: ["hall-orders"],
    queryFn: async () => {
      const res = await apiFetch("/orders");
      if (!res.ok) return [];
      const data: BackendOrder[] = await res.json();
      return data.map((o) => ({
        id: o.id,
        tableNumber: o.table.number,
        orderNumber: `#${o.id.slice(-6).toUpperCase()}`,
        status: o.status as HallOrder["status"],
        items: o.orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          type: i.menuItem.type,
        })),
        hallReceived: o.hallReceived,
        receivedAt: o.createdAt,
        startedAt: o.startedAt ?? undefined,
        completedAt: o.completedAt ?? undefined,
      }));
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const channel = supabase
      .channel(`hall-orders-${storeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order", filter: `storeId=eq.${storeId}` },
        () => { void refetchOrders(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [storeId, refetchOrders]);

  const hallReceiveMutation = useMutation({
    mutationFn: async ({ orderId, hallReceived }: { orderId: string; hallReceived: boolean }) => {
      await apiFetch(`/orders/${orderId}/hall-receive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hallReceived }),
      });
    },
    onSuccess: () => { void refetchOrders(); },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: HallOrder["status"] }) => {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onSuccess: () => { void refetchOrders(); },
  });

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
              <h1 className="text-xl font-bold text-white leading-none">홀 화면</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {currentTime?.toLocaleTimeString("ko-KR") ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">실시간 연결됨</span>
            </div>
            <Link
              href="/hall/order"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              주문 입력
            </Link>
          </div>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_LIST.map((status) => (
            <div key={status}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">{status}</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${COLUMN_BADGE[status]}`}>
                  {ordersByStatus[status].length}
                </span>
              </div>

              <div className="space-y-3">
                {ordersByStatus[status].map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    status={status}
                    currentTime={currentTime}
                    isLoading={statusMutation.isPending && statusMutation.variables?.orderId === order.id}
                    onStatusChange={(orderId, newStatus) => statusMutation.mutate({ orderId, newStatus })}
                    onHallReceive={(orderId, hallReceived) => hallReceiveMutation.mutate({ orderId, hallReceived })}
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
