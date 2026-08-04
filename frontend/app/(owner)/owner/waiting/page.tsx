"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, GripVertical, PhoneCall, LogIn, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WaitingCustomer } from "@/types/waiting";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { useQuery, useMutation } from "@tanstack/react-query";

type WaitingRow = WaitingCustomer & { waitingTime: string };

const isDone = (status: WaitingCustomer["status"]) =>
  status === "입장완료" || status === "취소";

const statusBadgeClass = (status: WaitingCustomer["status"]) => {
  if (status === "호출중")
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse";
  if (status === "대기중") return "bg-white/10 text-gray-300 border-white/20";
  if (status === "입장완료")
    return "bg-green-500/20 text-green-400 border-green-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

export default function Page() {
  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<WaitingRow[]>({
    queryKey: ["waiting"],
    queryFn: async () => {
      const res = await apiFetch("/waiting");
      if (!res.ok) throw new Error(`웨이팅 목록을 불러오지 못했습니다 (${res.status})`);
      const data = await res.json();
      return data.map(
        (e: {
          id: string;
          number: number;
          phone: string;
          createdAt: string;
          status: WaitingCustomer["status"];
          guestResponse?: string | null;
        }) => ({
          id: e.id,
          number: e.number,
          phone: e.phone,
          registeredAt: e.createdAt,
          status: e.status,
          guestResponse: e.guestResponse,
          waitingTime: `${Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 60000)}분`,
        }),
      );
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("waiting-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "WaitingEntry" },
        () => { void refetch(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiFetch(`/waiting/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => { void refetch(); },
  });

  const handleCall = (id: string) => statusMutation.mutate({ id, status: "호출중" });
  const handleAdmit = (id: string) => statusMutation.mutate({ id, status: "입장완료" });
  const handleCancel = (id: string) => statusMutation.mutate({ id, status: "취소" });

  const maskPhone = (phone: string) =>
    phone.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");

  const stats = {
    waiting: customers.filter((c) => c.status === "대기중").length,
    totalToday: customers.filter((c) => c.status === "입장완료").length,
    avgWaitTime: 23,
    cancelled: customers.filter((c) => c.status === "취소").length,
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (isDone(a.status) && !isDone(b.status)) return 1;
    if (!isDone(a.status) && isDone(b.status)) return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">
      <OwnerSidebar active="waiting" />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {isLoading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </>
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gray-800 rounded-xl p-4 md:p-5 border border-white/10">
            <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              현재 대기 팀
            </p>
            <p className="text-2xl md:text-3xl text-orange-400">
              {stats.waiting}팀
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 md:p-5 border border-white/10">
            <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              오늘 총 입장
            </p>
            <p className="text-2xl md:text-3xl text-white">
              {stats.totalToday}팀
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 md:p-5 border border-white/10">
            <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              평균 대기 시간
            </p>
            <p className="text-2xl md:text-3xl text-white">
              {stats.avgWaitTime}분
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 md:p-5 border border-white/10">
            <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              취소 수
            </p>
            <p className="text-2xl md:text-3xl text-red-400">
              {stats.cancelled}팀
            </p>
          </div>
        </div>

        {/* Mobile: 카드 리스트 */}
        <div className="md:hidden">
          <h2 className="text-base text-white mb-3">대기 목록</h2>
          {sortedCustomers.length === 0 && (
            <p className="text-center text-gray-600 py-12">
              대기 중인 손님이 없어요
            </p>
          )}
          <div className="space-y-3">
            {sortedCustomers.map((customer) => {
              const done = isDone(customer.status);
              return (
                <div
                  key={customer.id}
                  className={`bg-gray-900 rounded-xl border p-4 transition-opacity ${
                    done
                      ? "opacity-40 border-white/5"
                      : customer.status === "호출중"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-semibold ${done ? "line-through text-gray-500" : "text-white"}`}
                      >
                        {customer.number}번
                      </span>
                      <Badge className={statusBadgeClass(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                    {customer.guestResponse && (
                      <Badge
                        className={
                          customer.guestResponse === "가고있어요"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        }
                      >
                        {customer.guestResponse}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span>{maskPhone(customer.phone)}</span>
                    <span className="text-gray-600">·</span>
                    <span>
                      {new Date(customer.registeredAt).toLocaleTimeString(
                        "ko-KR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                    <span className="text-gray-600">·</span>
                    <span>{customer.waitingTime}</span>
                  </div>
                  {!done && (
                    <div className="flex gap-2">
                      {customer.status === "대기중" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleCall(customer.id)}
                        >
                          <PhoneCall className="w-3 h-3 mr-1" />
                          호출
                        </Button>
                      )}
                      {(customer.status === "대기중" ||
                        customer.status === "호출중") && (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleAdmit(customer.id)}
                        >
                          <LogIn className="w-3 h-3 mr-1" />
                          입장
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                        onClick={() => handleCancel(customer.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablet/PC: 테이블 */}
        <div className="hidden md:block bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg text-white">대기 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-12 text-gray-500 hidden lg:table-cell" />
                  <TableHead className="text-gray-500">대기번호</TableHead>
                  <TableHead className="text-gray-500">전화번호</TableHead>
                  <TableHead className="text-gray-500 hidden lg:table-cell">
                    등록 시각
                  </TableHead>
                  <TableHead className="text-gray-500 hidden lg:table-cell">
                    대기 시간
                  </TableHead>
                  <TableHead className="text-gray-500">상태</TableHead>
                  <TableHead className="text-gray-500">손님 응답</TableHead>
                  <TableHead className="text-gray-500 text-right">
                    액션
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCustomers.map((customer) => {
                  const done = isDone(customer.status);
                  return (
                    <TableRow
                      key={customer.id}
                      className={`border-white/5 transition-colors ${
                        done
                          ? "opacity-40"
                          : customer.status === "호출중"
                            ? "bg-yellow-500/10 hover:bg-yellow-500/15"
                            : "hover:bg-white/5"
                      }`}
                    >
                      <TableCell className="hidden lg:table-cell">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
                      </TableCell>
                      <TableCell
                        className={`text-lg ${done ? "line-through text-gray-500" : "text-white"}`}
                      >
                        {customer.number}번
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {maskPhone(customer.phone)}
                      </TableCell>
                      <TableCell className="text-gray-400 hidden lg:table-cell">
                        {new Date(customer.registeredAt).toLocaleTimeString(
                          "ko-KR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className="border-white/20 text-gray-400"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {customer.waitingTime}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.guestResponse ? (
                          <Badge
                            className={
                              customer.guestResponse === "가고있어요"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            }
                          >
                            {customer.guestResponse}
                          </Badge>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!done && (
                          <div className="flex items-center justify-end gap-2">
                            {customer.status === "대기중" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleCall(customer.id)}
                                >
                                  <PhoneCall className="w-3 h-3 mr-1" />
                                  호출
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleAdmit(customer.id)}
                                >
                                  <LogIn className="w-3 h-3 mr-1" />
                                  입장
                                </Button>
                              </>
                            )}
                            {customer.status === "호출중" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleAdmit(customer.id)}
                              >
                                <LogIn className="w-3 h-3 mr-1" />
                                입장
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                              onClick={() => handleCancel(customer.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              취소
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
