"use client";

import { Clock, Loader2 } from "lucide-react";
import { KitchenOrder } from "@/types/types";

const STATUS_LIST: KitchenOrder["status"][] = ["접수됨", "조리중", "완료"];

const COLUMN_STYLE: Record<
  KitchenOrder["status"],
  { cardBorder: string; btnActive: string }
> = {
  접수됨: { cardBorder: "border-white/10",      btnActive: "bg-orange-500 text-white" },
  조리중: { cardBorder: "border-yellow-500/30",  btnActive: "bg-yellow-500 text-gray-900" },
  완료:   { cardBorder: "border-green-500/30",   btnActive: "bg-green-600 text-white" },
};

type Props = {
  order: KitchenOrder;
  status: KitchenOrder["status"];
  currentTime: Date | null;
  isLoading: boolean;
  onStatusChange: (orderId: string, newStatus: KitchenOrder["status"]) => void;
};

export default function OrderCard({ order, status, currentTime, isLoading, onStatusChange }: Props) {
  const col = COLUMN_STYLE[status];

  const getCookingTime = (startedAt?: string) => {
    if (!startedAt || !currentTime) return null;
    return Math.floor((currentTime.getTime() - new Date(startedAt).getTime()) / 60000);
  };

  const getElapsedTime = (isoTime: string) => {
    if (!currentTime) return "...";
    const totalMin = Math.floor((currentTime.getTime() - new Date(isoTime).getTime()) / 60000);
    const days  = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const mins  = totalMin % 60;
    if (days > 0)  return `${days}일 ${hours}시간 ${mins}분`;
    if (hours > 0) return `${hours}시간 ${mins}분`;
    return `${mins}분 전`;
  };

  const cookingTime = getCookingTime(order.startedAt);
  const isOverTime  = cookingTime !== null && cookingTime > 15;

  return (
    <div className={`bg-[#1f2937] rounded-xl border p-4 ${col.cardBorder} ${status === "완료" ? "opacity-50" : ""}`}>
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-lg font-semibold text-white leading-none mb-1">
            테이블 {order.tableNumber}
          </p>
          <p className="text-xs text-gray-500">{order.orderNumber}</p>
        </div>
        {status === "조리중" && cookingTime !== null ? (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${isOverTime ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
            <Clock className="w-3 h-3" />
            {cookingTime}분
          </span>
        ) : (
          <span className="text-xs text-gray-500">{getElapsedTime(order.receivedAt)}</span>
        )}
      </div>

      {/* 주문 항목 */}
      <div className="space-y-1.5 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className={status === "완료" ? "text-gray-500" : "text-gray-200"}>{item.name}</span>
            <span className="text-gray-500">× {item.quantity}</span>
          </div>
        ))}
      </div>

      {/* 상태 변경 버튼 / 로딩 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              disabled={s === status}
              onClick={() => onStatusChange(order.id, s)}
              className={`text-xs font-medium py-1.5 rounded-lg transition-colors ${
                s === status
                  ? col.btnActive
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
