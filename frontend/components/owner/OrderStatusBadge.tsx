import { ReactNode } from "react";
import { OrderStatus } from "@/types/order";

const STATUS_COLOR: Record<OrderStatus, string> = {
  접수됨: "bg-white/10 text-gray-300 border border-white/20",
  조리중: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  완료: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export function OrderStatusBadge({
  status,
  children,
  className = "",
}: {
  status: OrderStatus;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLOR[status]} ${className}`}
    >
      {children ?? status}
    </span>
  );
}
