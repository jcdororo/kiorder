"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const mockDashboardStats = {
  todaySales: 457000,
  todayOrders: 32,
  currentWaiting: 5,
  averageWaitTime: 15,
  popularMenus: [
    { name: "김치찌개", count: 12 },
    { name: "제육볶음", count: 8 },
    { name: "비빔밥", count: 7 },
    { name: "불고기", count: 5 },
  ],
  salesByHour: [
    { hour: "09:00", sales: 23000 },
    { hour: "10:00", sales: 45000 },
    { hour: "11:00", sales: 78000 },
    { hour: "12:00", sales: 124000 },
    { hour: "13:00", sales: 98000 },
    { hour: "14:00", sales: 56000 },
    { hour: "15:00", sales: 33000 },
  ],
};

export default function Page() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [myStore, setMyStore] = useState<{ id: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    apiFetch("/stores/my")
      .then(async (res) => {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((data) => {
        if (data) setMyStore(data);
      });
  }, []);

  const handleCreateStore = async () => {
    if (!storeName.trim()) return;
    const res = await apiFetch("/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: storeName }),
    });
    if (res.ok) {
      const data = await res.json();
      setMyStore(data);
      toast.success("매장이 생성됐습니다.");
    } else {
      const err = await res.json();
      toast.error(err.message ?? "매장 생성 실패");
    }
  };

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/login");
  };
  const stats = mockDashboardStats;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-xl">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="m-0">관리자 대시보드</h1>
                <p className="text-muted-foreground">실시간 운영 현황</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 active:scale-90"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>

          {/* 빠른 링크 */}
          <div className="flex gap-3">
            <Link
              href="/admin/waiting"
              className="px-4 py-2 bg-white border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
            >
              웨이팅 관리
            </Link>
            <Link
              href="/admin/menu"
              className="px-4 py-2 bg-white border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
            >
              메뉴 관리
            </Link>
            <Link
              href="/admin/table-settings"
              className="px-4 py-2 bg-white border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
            >
              테이블 설정
            </Link>

            {!myStore && (
              <div className="flex gap-2 mt-4">
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="매장 이름 입력"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <Button onClick={handleCreateStore}>매장 생성</Button>
              </div>
            )}
            {myStore && (
              <p className="mt-4 text-sm text-green-600">
                ✅ 내 매장: {myStore.name}
              </p>
            )}
          </div>
        </div>

        {/* 핵심 지표 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-muted-foreground">오늘 매출</div>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.todaySales.toLocaleString()}원
            </div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              전일 대비 +12%
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-muted-foreground">오늘 주문</div>
              <ShoppingBag className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.todayOrders}건
            </div>
            <div className="text-sm text-muted-foreground">
              평균 주문금액:{" "}
              {Math.round(
                stats.todaySales / stats.todayOrders,
              ).toLocaleString()}
              원
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-muted-foreground">현재 대기팀</div>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {stats.currentWaiting}팀
            </div>
            <div className="text-sm text-muted-foreground">최대 대기: 8팀</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <div className="text-muted-foreground">평균 대기시간</div>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats.averageWaitTime}분
            </div>
            <div className="text-sm text-green-600">목표: 20분 이내</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 시간대별 매출 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="mb-6">시간대별 매출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salesByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()}원`]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="sales" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 인기 메뉴 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="mb-6">인기 메뉴 TOP 4</h3>
            <div className="space-y-4">
              {stats.popularMenus.map((menu, idx) => {
                const maxCount = stats.popularMenus[0].count;
                const percentage = (menu.count / maxCount) * 100;

                return (
                  <div key={menu.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{menu.name}</span>
                      </div>
                      <span className="font-bold text-primary">
                        {menu.count}건
                      </span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-orange-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
