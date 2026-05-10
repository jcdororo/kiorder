"use client";

import { Clock, Loader2 } from "lucide-react";
import { HallOrder } from "@/types/types";

const STATUS_LIST: HallOrder["status"][] = ["접수됨", "조리중", "완료"];

const COLUMN_STYLE: Record<
  HallOrder["status"],
  { cardBorder: string; btnActive: string }
> = {
  접수됨: { cardBorder: "border-white/10",     btnActive: "bg-orange-500 text-white" },
  조리중: { cardBorder: "border-yellow-500/30", btnActive: "bg-yellow-500 text-gray-900" },
  완료:   { cardBorder: "border-green-500/30",  btnActive: "bg-green-600 text-white" },
};

const TYPE_BADGE: Record<string, string> = {
  FOOD:    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DRINK:   "bg-sky-500/20 text-sky-400 border-sky-500/30",
  SERVICE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const TYPE_LABEL: Record<string, string> = {
  FOOD:    "주방",
  DRINK:   "음료",
  SERVICE: "직원",
};

type Props = {
  order: HallOrder;
  status: HallOrder["status"];
  currentTime: Date | null;
  isLoading: boolean;
  onStatusChange: (orderId: string, newStatus: HallOrder["status"]) => void;
  onHallReceive: (orderId: string, hallReceived: boolean) => void;
};

export default function OrderCard({ order, status, currentTime, isLoading, onStatusChange, onHallReceive }: Props) {
  const col = COLUMN_STYLE[status];

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

  const getCookingTime = (startedAt?: string) => {
    if (!startedAt || !currentTime) return null;
    return Math.floor((currentTime.getTime() - new Date(startedAt).getTime()) / 60000);
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
      <div className="space-y-1.5 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TYPE_BADGE[item.type] ?? TYPE_BADGE.FOOD}`}>
                {TYPE_LABEL[item.type] ?? item.type}
              </span>
              <span className={status === "완료" ? "text-gray-500" : "text-gray-200"}>{item.name}</span>
            </div>
            <span className="text-gray-500">× {item.quantity}</span>
          </div>
        ))}
      </div>

      {/* 홀 받음 버튼 */}
      <button
        onClick={() => onHallReceive(order.id, !order.hallReceived)}
        className={`w-full text-xs font-medium py-1.5 rounded-lg mb-3 border transition-colors ${
          order.hallReceived
            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
        }`}
      >
        {order.hallReceived ? "홀 받음 ✓" : "홀 미받음 — 터치하여 접수"}
      </button>

      {/* 상태 변경 버튼 */}
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
