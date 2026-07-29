import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { AdminMenuItem, MenuItemType } from "@/types/menu";

export type MenuPayload = {
  name: string;
  category: string;
  price: number;
  type: MenuItemType;
  description?: string;
  image?: string;
};

export function useOwnerMenu(options?: { onSaved?: () => void }) {
  const queryClient = useQueryClient();

  const { data: menuItems = [] } = useQuery<AdminMenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await apiFetch("/menu");
      if (!res.ok) throw new Error();
      return res.json();
    },
    throwOnError: () => {
      toast.error("메뉴를 불러오지 못했습니다.");
      return false;
    },
  });

  const categories = useMemo(
    () => ["전체", ...new Set(menuItems.map((item) => item.category))],
    [menuItems],
  );

  const invalidateMenu = () =>
    queryClient.invalidateQueries({ queryKey: ["menu"] });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      available,
    }: {
      id: string;
      available: boolean;
    }) => {
      const res = await apiFetch(`/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
    },
    onSuccess: invalidateMenu,
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
    },
    onSuccess: invalidateMenu,
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ data, id }: { data: MenuPayload; id?: string }) => {
      const res = await apiFetch(id ? `/menu/${id}` : "/menu", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      return res.json();
    },
    onSuccess: () => {
      invalidateMenu();
      options?.onSaved?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    menuItems,
    categories,
    toggleMutation,
    deleteMutation,
    saveMutation,
  };
}
