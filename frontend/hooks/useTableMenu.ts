import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MenuItem } from "@/types/menu";

export type TableOrder = {
  id: string;
  status: string;
  createdAt: string;
  orderItems: { name: string; price: number; quantity: number }[];
};

export function useTableMenu(tableId: string) {
  const { data: tableOrders = [], refetch: refetchOrders } = useQuery<
    TableOrder[]
  >({
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

  const { data: menus = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await apiFetch("/menu");
      if (!res.ok) throw new Error(`메뉴 로딩 실패: ${res.status}`);
      return res.json();
    },
  });

  const serviceMenus = menus.filter((m) => m.available && m.type === "SERVICE");

  const { categories, grouped } = useMemo(() => {
    const orderMenus = menus.filter((m) => m.available && m.type !== "SERVICE");
    const cats = [
      "전체",
      ...Array.from(new Set(orderMenus.map((m) => m.category))),
    ];
    const grp = cats
      .filter((c) => c !== "전체")
      .map((cat) => ({
        category: cat,
        items: orderMenus.filter((m) => m.category === cat),
      }))
      .filter((g) => g.items.length > 0);
    return { categories: cats, grouped: grp };
  }, [menus]);

  const receiptItems = useMemo(() => {
    const map = new Map<
      string,
      { name: string; price: number; quantity: number }
    >();
    tableOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const existing = map.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          map.set(item.name, {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [tableOrders]);

  const grandTotal = receiptItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const receiptTime =
    tableOrders.length > 0
      ? new Date(tableOrders[0].createdAt).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return {
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
  };
}
