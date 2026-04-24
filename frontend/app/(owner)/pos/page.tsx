"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { Order } from "@/types/types";

const mockOrders: Order[] = [
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
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const tables = Array.from({ length: 10 }, (_, i) => i + 1);
  const tableOrders = selectedTable
    ? mockOrders.filter(
        (o) => o.tableNumber === selectedTable && o.paymentStatus === "UNPAID",
      )
    : [];

  const totalAmount = tableOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const handlePayment = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedTable(null);
    }, 2000);
  };

  const handleClearTable = () => {
    setSelectedTable(null);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-2">결제 완료!</h1>
          <p className="text-muted-foreground">
            테이블 {selectedTable}번 결제가 완료되었습니다
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary p-3 rounded-xl">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="m-0">포스 결제</h1>
              <p className="text-muted-foreground">
                테이블을 선택하고 결제를 진행하세요
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 테이블 선택 */}
          <div>
            <h3 className="mb-4">테이블 선택</h3>
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="grid grid-cols-5 gap-3">
                {tables.map((table) => {
                  const hasOrders = mockOrders.some(
                    (o) =>
                      o.tableNumber === table && o.paymentStatus === "UNPAID",
                  );

                  return (
                    <button
                      key={table}
                      onClick={() => setSelectedTable(table)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                        selectedTable === table
                          ? "bg-primary text-white shadow-lg scale-105"
                          : hasOrders
                            ? "bg-orange-50 border-2 border-primary hover:bg-orange-100"
                            : "bg-accent hover:bg-accent/80"
                      }`}
                    >
                      <div className="text-2xl font-bold mb-1">{table}</div>
                      {hasOrders && selectedTable !== table && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-muted-foreground">주문 있음</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full border" />
                  <span className="text-muted-foreground">주문 없음</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 내역 & 결제 */}
          <div>
            <h3 className="mb-4">
              주문 내역 {selectedTable && `- 테이블 ${selectedTable}`}
            </h3>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {!selectedTable ? (
                <div className="p-12 text-center text-muted-foreground">
                  <CreditCard className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>테이블을 선택해주세요</p>
                </div>
              ) : tableOrders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>결제할 주문이 없습니다</p>
                </div>
              ) : (
                <>
                  <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="space-y-6">
                      {tableOrders.map((order) => (
                        <div
                          key={order.id}
                          className="pb-6 border-b last:border-0"
                        >
                          <div className="text-sm text-muted-foreground mb-3">
                            주문 #{order.id.slice(0, 8)} •{" "}
                            {order.createdAt.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{item.menuName}</span>
                                  <span className="text-muted-foreground">
                                    x {item.quantity}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                  원
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-t">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg">총 결제금액</span>
                      <span className="text-3xl font-bold text-primary">
                        {totalAmount.toLocaleString()}원
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleClearTable}
                        className="py-4 bg-white border-2 border-border rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        테이블 정리
                      </button>
                      <button
                        onClick={handlePayment}
                        className="py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
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
