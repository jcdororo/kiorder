import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  // Realtime 구독을 매장 단위로 좁히기 위한 storeId. ["store","my"]는 홀·주방과
  // 공유하는 키라 캐시를 그대로 재사용한다(추가 요청이 생기지 않는다).
  //
  // 이 값이 없으면 아래 구독이 아예 붙지 않고, ["pos-all-orders"]에는 polling이
  // 없어서 신규 주문이 POS 그리드에 영영 안 뜬다. Render 무료 티어 콜드스타트
  // (30~60초) 중 진입하면 502 HTML이 오는 게 상수인 환경이라, 한 번 실패하고
  // 끝나지 않도록 (1) 상태 코드를 검사해 조용한 파싱 오류를 막고
  // (2) storeId를 얻을 때까지 10초 간격으로 다시 시도한다. 얻은 뒤엔 멈춘다.
  const { data: storeData } = useQuery<{ id: string; name: string } | null>({
    queryKey: ["store", "my"],
    queryFn: async () => {
      const res = await apiFetch("/stores/my");
      if (!res.ok) throw new Error(`매장 정보를 불러오지 못했습니다 (${res.status})`);
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    refetchInterval: (query) => (query.state.data?.id ? false : 10_000),
  });
  const storeId = storeData?.id ?? null;

  const {
    data: tables = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Table[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await apiFetch("/tables");
      if (!res.ok) throw new Error(`테이블을 불러오지 못했습니다 (${res.status})`);
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

  // 다른 디바이스(홀·주방·테이블오더)가 만든 변경을 받기 위한 구독.
  // 자기 결제 결과는 아래 paymentMutation이 직접 반영하므로 여기에 기대지 않는다.
  useEffect(() => {
    if (!storeId) return;
    const channel = supabase
      .channel(`pos-orders-${storeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order", filter: `storeId=eq.${storeId}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["pos-all-orders"] });
          if (selectedTableRef.current) {
            void queryClient.invalidateQueries({
              queryKey: ["table-orders", selectedTableRef.current.id],
            });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, storeId]);

  const invalidateOrders = () => {
    void queryClient.invalidateQueries({ queryKey: ["pos-all-orders"] });
    if (selectedTable?.id) {
      void queryClient.invalidateQueries({
        queryKey: ["table-orders", selectedTable.id],
      });
    }
  };

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // fetch는 401·500에도 reject하지 않는다. res.ok를 안 보면 실패해도
      // onSuccess가 발화해 초록 "결제 완료!"가 뜨고, 곧이어 refetch된 주문이
      // 남아 테이블이 다시 주황이 된다 — 이번에 고치려던 [C] 증상과 육안 구별이
      // 안 되는 화면이 만들어진다.
      //
      // 실패한 요청이 나와도 나머지를 중단하지 않는다. 이미 날아간 PATCH는
      // 취소할 수 없어 중단해봐야 부분 성공은 그대로 남고, 오히려 "어디까지
      // 처리됐는지"를 알 수 없게 된다. 전부 시도한 뒤 결과를 집계해 실패가
      // 하나라도 있으면 성공 화면으로 넘어가지 않는다.
      const results = await Promise.all(
        tableOrders.map(async (o) => {
          try {
            const res = await apiFetch(`/orders/${o.id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "결제완료" }),
            });
            return res.ok;
          } catch {
            // 네트워크 단절도 실패 1건으로 센다. 여기서 reject시키면 브라우저
            // 기본 문구("Failed to fetch")가 사장님 화면에 그대로 뜬다.
            return false;
          }
        }),
      );
      const failed = results.filter((ok) => !ok).length;
      if (failed > 0) {
        throw new Error(
          failed === results.length
            ? "결제 처리에 실패했습니다. 다시 시도해주세요."
            : `일부 주문이 결제되지 않았습니다 (${failed}/${results.length}건 실패). 남은 주문을 확인하고 다시 결제해주세요.`,
        );
      }
    },
    // Realtime 이벤트가 한 번이라도 유실되면 결제한 테이블이 계속 "주문 있음"으로
    // 남았다(새로고침해야 사라짐). mutation이 자기 결과를 스스로 반영하게 한다.
    onSuccess: () => {
      invalidateOrders();
      options?.onPaid?.();
    },
    // 부분 실패면 일부 주문만 결제완료로 남는다. 화면을 서버 상태에 다시 맞춰야
    // 사장님이 "무엇이 남았는지" 보고 다시 결제할 수 있다.
    onError: (error: Error) => {
      invalidateOrders();
      toast.error(error.message || "결제 처리에 실패했습니다.");
    },
  });

  const totalAmount = tableOrders.reduce(
    (sum, o) => sum + o.orderItems.reduce((s, i) => s + i.price * i.quantity, 0),
    0,
  );

  const hasActiveOrders = (tableId: string) =>
    allOrders.some((o) => o.tableId === tableId && o.status !== "결제완료");

  return {
    tables,
    tableOrders,
    totalAmount,
    hasActiveOrders,
    paymentMutation,
    isLoading,
    isError,
    refetch,
  };
}
