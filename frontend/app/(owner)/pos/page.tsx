"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Table = { id: string; number: number };
type PosOrderItem = { name: string; price: number; quantity: number };
type PosOrder = {
  id: string;
  tableId: string;
  status: string;
  createdAt: string;
  orderItems: PosOrderItem[];
};

export default function Page() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const selectedTableRef = useRef<Table | null>(null);

  useEffect(() => {
    selectedTableRef.current = selectedTable;
  }, [selectedTable]);

  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await apiFetch("/tables");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: allOrders = [] } = useQuery<PosOrder[]>({
    queryKey: ["pos-all-orders"],
    queryFn: async () => {
      const res = await apiFetch("/orders");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: tableOrders = [] } = useQuery<PosOrder[]>({
    queryKey: ["table-orders", selectedTable?.id],
    queryFn: async () => {
      const res = await apiFetch(`/orders?tableId=${selectedTable!.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedTable?.id,
  });

  useEffect(() => {
    const channel = supabase
      .channel("pos-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["pos-all-orders"] });
        if (selectedTableRef.current) {
          void queryClient.invalidateQueries({ queryKey: ["table-orders", selectedTableRef.current.id] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        tableOrders.map((o) =>
          apiFetch(`/orders/${o.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "결제완료" }),
          }),
        ),
      );
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedTable(null);
      }, 2000);
    },
  });

  const totalAmount = tableOrders.reduce(
    (sum, o) => sum + o.orderItems.reduce((s, i) => s + i.price * i.quantity, 0),
    0,
  );

  const hasActiveOrders = (tableId: string) =>
    allOrders.some((o) => o.tableId === tableId && o.status !== "결제완료");

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">결제 완료!</h1>
          <p className="text-gray-400">
            테이블 {selectedTable?.number}번 결제가 완료되었습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-orange-500 p-3 rounded-xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white m-0">포스 결제</h1>
            <p className="text-gray-400 text-sm mt-0.5">테이블을 선택하고 결제를 진행하세요</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 테이블 선택 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">테이블 선택</h3>
            <div className="bg-[#1f2937] rounded-xl border border-white/10 p-6">
              <div className="grid grid-cols-5 gap-3">
                {tables.map((table) => {
                  const active = hasActiveOrders(table.id);
                  const isSelected = selectedTable?.id === table.id;
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-orange-500 text-white scale-105 shadow-lg shadow-orange-500/20"
                          : active
                            ? "bg-orange-500/10 border-2 border-orange-500/40 text-orange-400 hover:bg-orange-500/20"
                            : "bg-[#374151] text-gray-400 hover:bg-[#4b5563] hover:text-white"
                      }`}
                    >
                      <div className="text-2xl font-bold mb-1">{table.number}</div>
                      {active && !isSelected && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500/10 border border-orange-500/40" />
                  <span>주문 있음</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#374151]" />
                  <span>주문 없음</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 내역 & 결제 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              주문 내역{selectedTable && ` — 테이블 ${selectedTable.number}`}
            </h3>
            <div className="bg-[#1f2937] rounded-xl border border-white/10 overflow-hidden">
              {!selectedTable ? (
                <div className="p-12 text-center text-gray-600">
                  <CreditCard className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">테이블을 선택해주세요</p>
                </div>
              ) : tableOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-600">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">결제할 주문이 없습니다</p>
                </div>
              ) : (
                <>
                  <div className="p-6 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-6">
                      {tableOrders.map((order) => (
                        <div
                          key={order.id}
                          className="pb-6 border-b border-white/10 last:border-0"
                        >
                          <div className="text-xs text-gray-500 mb-3">
                            주문 #{order.id.slice(0, 8)} •{" "}
                            {new Date(order.createdAt).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="space-y-2">
                            {order.orderItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-white">{item.name}</span>
                                  <span className="text-gray-500">x{item.quantity}</span>
                                </div>
                                <span className="font-bold text-orange-400">
                                  {(item.price * item.quantity).toLocaleString()}원
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111827] px-6 py-5 border-t border-white/10">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-gray-400 text-sm">총 결제금액</span>
                      <span className="text-3xl font-bold text-orange-400">
                        {totalAmount.toLocaleString()}원
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedTable(null)}
                        className="py-3.5 bg-transparent border border-white/20 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        테이블 정리
                      </button>
                      <button
                        onClick={() => paymentMutation.mutate()}
                        disabled={paymentMutation.isPending}
                        className="py-3.5 bg-orange-500 hover:bg-[#ea580c] disabled:opacity-60 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                      >
                        {paymentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        카드 결제
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
