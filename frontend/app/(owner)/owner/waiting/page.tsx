"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { WaitingCustomer } from "@/types/types";
import { supabase } from "@/lib/supabase";

type WaitingRow = WaitingCustomer & { waitingTime: string };

const isDone = (status: WaitingCustomer["status"]) =>
  status === "입장완료" || status === "취소";

export default function Page() {
  const router = useRouter();
  const [customers, setCustomers] = useState<WaitingRow[]>([]);

  useEffect(() => {
    const fetchWaiting = () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) =>
          setCustomers(
            data.map(
              (e: {
                id: string;
                number: number;
                phone: string;
                createdAt: string;
                status: WaitingCustomer["status"];
              }) => ({
                id: e.id,
                number: e.number,
                phone: e.phone,
                registeredAt: e.createdAt,
                status: e.status,
                waitingTime: `${Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 60000)}분`,
              }),
            ),
          ),
        );

    fetchWaiting();

    const channel = supabase
      .channel("waiting-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "WaitingEntry" },
        () => {
          fetchWaiting();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
  };

  const handleCall = async (id: string) => {
    await updateStatus(id, "호출중");
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: "호출중" as const } : c,
      ),
    );
  };

  const handleAdmit = async (id: string) => {
    await updateStatus(id, "입장완료");
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: "입장완료" as const } : c,
      ),
    );
  };

  const handleCancel = async (id: string) => {
    await updateStatus(id, "취소");
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: "취소" as const } : c,
      ),
    );
  };

  const maskPhone = (phone: string) =>
    phone.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");

  const stats = {
    waiting: customers.filter((c) => c.status === "대기중").length,
    totalToday: 45,
    avgWaitTime: 23,
    cancelled: customers.filter((c) => c.status === "취소").length,
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (isDone(a.status) && !isDone(b.status)) return 1;
    if (!isDone(a.status) && isDone(b.status)) return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-60 bg-gray-900 border-r border-white/10 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl text-white mb-1">맛있는 식당</h1>
          <p className="text-sm text-gray-500">관리자</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            웨이팅 관리
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/owner/menu")}
          >
            메뉴 관리
          </Button>
        </nav>

        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-white hover:bg-white/10"
          >
            홈으로
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-white/10">
            <p className="text-sm text-gray-500 mb-2">현재 대기 팀</p>
            <p className="text-3xl text-orange-400">{stats.waiting}팀</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-white/10">
            <p className="text-sm text-gray-500 mb-2">오늘 총 입장</p>
            <p className="text-3xl text-white">{stats.totalToday}팀</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-white/10">
            <p className="text-sm text-gray-500 mb-2">평균 대기 시간</p>
            <p className="text-3xl text-white">{stats.avgWaitTime}분</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-white/10">
            <p className="text-sm text-gray-500 mb-2">취소 수</p>
            <p className="text-3xl text-red-400">{stats.cancelled}팀</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg text-white">대기 목록</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-12 text-gray-500"></TableHead>
                <TableHead className="text-gray-500">대기번호</TableHead>
                <TableHead className="text-gray-500">전화번호</TableHead>
                <TableHead className="text-gray-500">등록 시각</TableHead>
                <TableHead className="text-gray-500">대기 시간</TableHead>
                <TableHead className="text-gray-500">상태</TableHead>
                <TableHead className="text-gray-500 text-right">액션</TableHead>
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
                    <TableCell>
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
                    <TableCell className="text-gray-400">
                      {new Date(customer.registeredAt).toLocaleTimeString(
                        "ko-KR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-white/20 text-gray-400"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {customer.waitingTime}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          customer.status === "호출중"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse"
                            : customer.status === "대기중"
                              ? "bg-white/10 text-gray-300 border-white/20"
                              : customer.status === "입장완료"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {customer.status}
                      </Badge>
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
    </div>
  );
}
