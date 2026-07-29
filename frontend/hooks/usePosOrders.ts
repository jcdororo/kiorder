import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { Table, PosOrder } from "@/types/order";

export function usePosOrders(
  selectedTable: Table | null,
  options?: { onPaid?: () => void },
) {
  const queryClient = useQueryClient();

  // Realtime 콜백 안에서 최신 선택 테이블을 참조하기 위한 ref (구독 재연결 방지)
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
          void queryClient.invalidateQueries({
            queryKey: ["table-orders", selectedTableRef.current.id],
          });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
    onSuccess: () => options?.onPaid?.(),
  });

  const totalAmount = tableOrders.reduce(
    (sum, o) => sum + o.orderItems.reduce((s, i) => s + i.price * i.quantity, 0),
    0,
  );

  const hasActiveOrders = (tableId: string) =>
    allOrders.some((o) => o.tableId === tableId && o.status !== "결제완료");

  return { tables, tableOrders, totalAmount, hasActiveOrders, paymentMutation };
}
