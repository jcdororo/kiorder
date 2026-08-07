"use client";

import { useState, useEffect } from "react";
import { BackToTour } from "@/components/shared/BackToTour";
import { BackendOrder, KitchenOrder } from "@/types/order";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import OrderCard from "@/components/kitchen/OrderCard";
import { OrderStatusBadge } from "@/components/owner/OrderStatusBadge";
import { BoardSkeleton } from "@/components/shared/BoardSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useQuery, useMutation } from "@tanstack/react-query";

const STATUS_LIST: KitchenOrder["status"][] = ["접수됨", "조리중", "완료"];

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

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch: refetchOrders,
  } = useQuery<KitchenOrder[]>({
    queryKey: ["kitchen-orders"],
    queryFn: async () => {
      const res = await apiFetch("/orders");
      if (!res.ok) throw new Error(`주문을 불러오지 못했습니다 (${res.status})`);
      const data: BackendOrder[] = await res.json();
      return data.map((o) => ({
        id: o.id,
        tableNumber: o.table.number,
        orderNumber: `#${o.id.slice(-6).toUpperCase()}`,
        status: o.status as KitchenOrder["status"],
        items: o.orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          needsKitchen: i.needsKitchen,
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
      .channel(`kitchen-orders-${storeId}`)
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
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: KitchenOrder["status"] }) => {
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
    완료: orders.filter((o) => o.status === "완료"),
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* 헤더 */}
      <div className="bg-[#1f2937] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToTour />
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
        {isLoading ? (
          <BoardSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => void refetchOrders()} />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_LIST.map((status) => (
            <div key={status}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">{status}</h2>
                <OrderStatusBadge status={status}>
                  {ordersByStatus[status].length}
                </OrderStatusBadge>
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
        )}
      </div>
    </div>
  );
}
