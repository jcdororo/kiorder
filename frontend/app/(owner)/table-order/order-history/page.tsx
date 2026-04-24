"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, ChefHat, XCircle } from "lucide-react";
import { Order } from "@/types/types";

export const mockOrders: Order[] = [
  {
    id: "1",
    tableNumber: 3,
    items: [
      { menuId: "1", menuName: "김치찌개", quantity: 2, price: 9000 },
      { menuId: "7", menuName: "공기밥", quantity: 2, price: 1000 },
    ],
    status: "PENDING",
    paymentStatus: "UNPAID",
    totalAmount: 20000,
    createdAt: new Date("2026-04-14T12:00:00"),
  },
  {
    id: "2",
    tableNumber: 5,
    items: [
      { menuId: "4", menuName: "제육볶음", quantity: 1, price: 12000 },
      { menuId: "7", menuName: "공기밥", quantity: 1, price: 1000 },
      { menuId: "10", menuName: "콜라", quantity: 2, price: 2000 },
    ],
    status: "COOKING",
    paymentStatus: "UNPAID",
    totalAmount: 17000,
    createdAt: new Date("2026-04-14T11:55:00"),
  },
  {
    id: "3",
    tableNumber: 7,
    items: [
      { menuId: "6", menuName: "비빔밥", quantity: 2, price: 9500 },
      { menuId: "8", menuName: "계란말이", quantity: 1, price: 6000 },
    ],
    status: "COMPLETED",
    paymentStatus: "UNPAID",
    totalAmount: 25000,
    createdAt: new Date("2026-04-14T11:45:00"),
    completedAt: new Date("2026-04-14T12:05:00"),
  },
  {
    id: "4",
    tableNumber: 2,
    items: [
      { menuId: "2", menuName: "된장찌개", quantity: 1, price: 8000 },
      { menuId: "7", menuName: "공기밥", quantity: 1, price: 1000 },
    ],
    status: "COOKING",
    paymentStatus: "UNPAID",
    totalAmount: 9000,
    createdAt: new Date("2026-04-14T12:02:00"),
  },
];

export default function Page() {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const tableOrders = mockOrders.filter(
    (order) => order.tableNumber === Number(tableNumber),
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: Clock,
          text: "접수 대기",
          color: "text-yellow-600",
          bg: "bg-yellow-50",
        };
      case "COOKING":
        return {
          icon: ChefHat,
          text: "조리 중",
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "COMPLETED":
        return {
          icon: CheckCircle2,
          text: "완료",
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          text: "취소됨",
          color: "text-red-600",
          bg: "bg-red-50",
        };
      default:
        return {
          icon: Clock,
          text: "대기",
          color: "text-gray-600",
          bg: "bg-gray-50",
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Link
          href={`/table-order/menu`}
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>메뉴로 돌아가기</span>
        </Link>

        <div className="mb-8">
          <h1 className="mb-2">주문 내역</h1>
          <p className="text-muted-foreground">
            테이블 {tableNumber}번의 주문 현황입니다
          </p>
        </div>

        {tableOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <ChefHat className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>아직 주문 내역이 없습니다</p>
            </div>
            <Link
              href={`/table-order/menu`}
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors no-underline"
            >
              메뉴 보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tableOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${statusInfo.bg} ${statusInfo.color} px-3 py-1.5 rounded-lg flex items-center gap-2`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium">{statusInfo.text}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                      {order.status === "PENDING" && (
                        <button className="text-sm text-destructive hover:underline">
                          주문 취소
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.menuName}</span>
                            <span className="text-muted-foreground">
                              x {item.quantity}
                            </span>
                          </div>
                          <span className="font-medium">
                            {(item.price * item.quantity).toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <span className="font-medium">합계</span>
                      <span className="text-xl font-bold text-primary">
                        {order.totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {order.status === "COOKING" && (
                    <div className="bg-blue-50 px-6 py-3 flex items-center gap-2 text-sm text-blue-800">
                      <ChefHat className="w-4 h-4" />
                      <span>주방에서 조리 중입니다. 잠시만 기다려주세요!</span>
                    </div>
                  )}

                  {order.status === "COMPLETED" && (
                    <div className="bg-green-50 px-6 py-3 flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>음식이 준비되었습니다. 맛있게 드세요!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link
          href={`/table/${tableNumber}/menu`}
          className="block w-full mt-6 py-4 bg-primary text-white rounded-xl text-center hover:bg-primary/90 transition-colors no-underline"
        >
          추가 주문하기
        </Link>
      </div>
    </div>
  );
}
