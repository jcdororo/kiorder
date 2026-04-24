"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Clock,
  GripVertical,
  PhoneCall,
  LogIn,
  X,
} from "lucide-react";
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

export default function Page() {
  const router = useRouter();
  const [customers, setCustomers] = useState<WaitingCustomer[]>([]);

  useEffect(() => {
    setCustomers([
      {
        id: "1",
        number: 19,
        phone: "010-1234-5678",
        registeredAt: new Date(Date.now() - 25 * 60000).toISOString(),
        status: "대기중",
      },
      {
        id: "2",
        number: 20,
        phone: "010-2345-6789",
        registeredAt: new Date(Date.now() - 20 * 60000).toISOString(),
        status: "대기중",
      },
      {
        id: "3",
        number: 21,
        phone: "010-3456-7890",
        registeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
        status: "대기중",
      },
      {
        id: "4",
        number: 22,
        phone: "010-4567-8901",
        registeredAt: new Date(Date.now() - 10 * 60000).toISOString(),
        status: "대기중",
      },
      {
        id: "5",
        number: 23,
        phone: "010-5678-9012",
        registeredAt: new Date(Date.now() - 5 * 60000).toISOString(),
        status: "대기중",
      },
    ]);
  }, []);

  const getWaitingTime = (isoTime: string) => {
    const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000);
    return `${diff}분`;
  };

  const handleCall = (id: string) => {
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: "호출중" as const } : c,
      ),
    );
  };

  const handleAdmit = (id: string) => {
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: "입장완료" as const } : c,
      ),
    );
  };

  const handleCancel = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const maskPhone = (phone: string) => {
    return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");
  };

  const stats = {
    waiting: customers.filter((c) => c.status === "대기중").length,
    totalToday: 45,
    avgWaitTime: 23,
    cancelled: 3,
  };

  const activeCustomers = customers.filter(
    (c) => c.status !== "입장완료" && c.status !== "취소",
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-[#E5E7EB] p-4">
        <div className="mb-8">
          <h1 className="text-xl text-[#111827] mb-1">맛있는 식당</h1>
          <p className="text-sm text-[#6B7280]">관리자</p>
        </div>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            웨이팅 관리
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/admin/menu")}
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            메뉴 관리
          </Button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#6B7280]"
            >
              <Settings className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">
                현재 대기 팀
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-[#F97316]">{stats.waiting}팀</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">
                오늘 총 입장
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-[#111827]">{stats.totalToday}팀</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">
                평균 대기 시간
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-[#111827]">{stats.avgWaitTime}분</p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">취소 수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-[#EF4444]">{stats.cancelled}팀</p>
            </CardContent>
          </Card>
        </div>

        {/* Waiting List Table */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>대기 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>대기번호</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>등록 시각</TableHead>
                  <TableHead>대기 시간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className={
                      customer.status === "호출중" ? "bg-[#FACC15]/10" : ""
                    }
                  >
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-[#6B7280] cursor-move" />
                    </TableCell>
                    <TableCell className="text-lg">
                      {customer.number}번
                    </TableCell>
                    <TableCell className="text-[#6B7280]">
                      {maskPhone(customer.phone)}
                    </TableCell>
                    <TableCell className="text-[#6B7280]">
                      {new Date(customer.registeredAt).toLocaleTimeString(
                        "ko-KR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#E5E7EB]">
                        <Clock className="w-3 h-3 mr-1" />
                        {getWaitingTime(customer.registeredAt)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          customer.status === "호출중"
                            ? "bg-[#FACC15] text-[#111827] border-none animate-pulse"
                            : customer.status === "대기중"
                              ? "bg-gray-200 text-gray-700 border-none"
                              : "border-[#E5E7EB]"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {customer.status === "대기중" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                              onClick={() => handleCall(customer.id)}
                            >
                              <PhoneCall className="w-3 h-3 mr-1" />
                              호출
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
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
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => handleAdmit(customer.id)}
                          >
                            <LogIn className="w-3 h-3 mr-1" />
                            입장
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                          onClick={() => handleCancel(customer.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          취소
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
