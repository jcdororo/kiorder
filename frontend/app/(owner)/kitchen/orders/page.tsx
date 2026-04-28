"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { BackendOrder, KitchenOrder } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await apiFetch("/orders");
      if (!res.ok) return;
      const data = await res.json();
      setOrders(
        data.map((o: BackendOrder) => ({
          id: o.id,
          tableNumber: o.table.number,
          orderNumber: `#${o.id.slice(-6).toUpperCase()}`,
          status: o.status as KitchenOrder["status"],
          items: o.orderItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
          })),
          receivedAt: o.createdAt,
          startedAt: o.startedAt ?? undefined,
          completedAt: o.completedAt ?? undefined,
        })),
      );
    };

    fetchOrders();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        (payload) => {
          console.log("Realtime event:", payload);
          fetchOrders();
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const getElapsedTime = (isoTime: string) => {
    if (!currentTime) return "...";
    const diff = Math.floor(
      (currentTime.getTime() - new Date(isoTime).getTime()) / 60000,
    );
    return `${diff}분 전`;
  };

  const getCookingTime = (startedAt?: string) => {
    if (!startedAt || !currentTime) return null;
    if (!startedAt) return null;
    const diff = Math.floor(
      (currentTime.getTime() - new Date(startedAt).getTime()) / 60000,
    );
    return diff;
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: KitchenOrder["status"],
  ) => {
    await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const ordersByStatus = {
    접수됨: orders.filter((o) => o.status === "접수됨"),
    조리중: orders.filter((o) => o.status === "조리중"),
    완료: orders.filter((o) => o.status === "완료"),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white p-6 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl text-[#111827]">주방 화면</h1>
              <p className="text-sm text-[#6B7280]">
                {currentTime?.toLocaleTimeString("ko-KR") ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
            <span className="text-sm text-[#6B7280]">실시간 연결됨</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: 접수됨 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#111827]">접수됨</h2>
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                {ordersByStatus.접수됨.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {ordersByStatus.접수됨.map((order) => (
                <Card key={order.id} className="border-[#E5E7EB] bg-white">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xl text-[#111827] mb-1">
                          테이블 {order.tableNumber}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {order.orderNumber}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-200 text-gray-700"
                      >
                        {getElapsedTime(order.receivedAt)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-[#111827]">{item.name}</span>
                          <span className="text-[#6B7280]">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white"
                      onClick={() => handleStatusChange(order.id, "조리중")}
                    >
                      조리 시작
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Column 2: 조리중 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#111827]">조리중</h2>
              <Badge className="bg-[#FACC15] text-[#111827] border-none">
                {ordersByStatus.조리중.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {ordersByStatus.조리중.map((order) => {
                const cookingTime = getCookingTime(order.startedAt);
                const isOverTime = cookingTime !== null && cookingTime > 15;

                return (
                  <Card key={order.id} className="border-[#FACC15] bg-white">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xl text-[#111827] mb-1">
                            테이블 {order.tableNumber}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            {order.orderNumber}
                          </p>
                        </div>
                        <Badge
                          className={`${isOverTime ? "bg-[#EF4444]" : "bg-[#FACC15]"} text-white border-none`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {cookingTime}분
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-[#111827]">{item.name}</span>
                            <span className="text-[#6B7280]">
                              × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                        onClick={() => handleStatusChange(order.id, "완료")}
                      >
                        완료 처리
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Column 3: 완료 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#111827]">완료</h2>
              <Badge className="bg-[#22C55E] text-white border-none">
                {ordersByStatus.완료.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {ordersByStatus.완료.map((order) => (
                <Card
                  key={order.id}
                  className="border-[#22C55E] bg-white opacity-75"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xl text-[#111827] mb-1">
                          테이블 {order.tableNumber}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {order.orderNumber}
                        </p>
                      </div>
                      <Badge className="bg-[#22C55E] text-white border-none">
                        완료
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-[#6B7280]">{item.name}</span>
                          <span className="text-[#6B7280]">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
