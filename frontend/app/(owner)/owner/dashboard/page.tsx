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

const statCards = [
  {
    label: "오늘 매출",
    icon: DollarSign,
    getValue: (s: typeof mockDashboardStats) =>
      `${s.todaySales.toLocaleString()}원`,
    sub: (
      <span className="flex items-center gap-1 text-green-400">
        <TrendingUp className="w-3.5 h-3.5" />
        전일 대비 +12%
      </span>
    ),
  },
  {
    label: "오늘 주문",
    icon: ShoppingBag,
    getValue: (s: typeof mockDashboardStats) => `${s.todayOrders}건`,
    sub: (s: typeof mockDashboardStats) => (
      <span className="text-gray-500">
        평균 {Math.round(s.todaySales / s.todayOrders).toLocaleString()}원
      </span>
    ),
  },
  {
    label: "현재 대기팀",
    icon: Users,
    getValue: (s: typeof mockDashboardStats) => `${s.currentWaiting}팀`,
    sub: <span className="text-gray-500">최대 대기: 8팀</span>,
  },
  {
    label: "평균 대기시간",
    icon: Clock,
    getValue: (s: typeof mockDashboardStats) => `${s.averageWaitTime}분`,
    sub: <span className="text-green-400">목표: 20분 이내</span>,
  },
];

const quickLinks = [
  { href: "/owner/waiting", label: "웨이팅 관리" },
  { href: "/owner/menu", label: "메뉴 관리" },
  { href: "/owner/table-settings", label: "테이블 설정" },
];

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
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="mx-auto px-6 py-8 max-w-7xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-2.5 rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-none">관리자 대시보드</h1>
                <p className="text-sm text-gray-400 mt-0.5">실시간 운영 현황</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-white/20 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>

        {/* 빠른 링크 + 매장 정보 */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {!myStore && (
            <div className="flex gap-2 ml-auto">
              <input
                className="bg-[#374151] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="매장 이름 입력"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <button
                onClick={handleCreateStore}
                className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
              >
                매장 생성
              </button>
            </div>
          )}
          {myStore && (
            <span className="ml-auto text-sm text-gray-400">
              <span className="text-green-400 mr-1">●</span>
              {myStore.name}
            </span>
          )}
        </div>

        {/* 핵심 지표 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            const sub =
              typeof card.sub === "function" ? card.sub(stats) : card.sub;
            return (
              <div
                key={card.label}
                className="bg-[#1f2937] rounded-xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">{card.label}</span>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  {card.getValue(stats)}
                </div>
                <div className="text-xs">{sub}</div>
              </div>
            );
          })}
        </div>

        {/* 차트 + 인기 메뉴 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 시간대별 매출 */}
          <div className="bg-[#1f2937] rounded-xl border border-white/10 p-6">
            <h3 className="text-base font-semibold text-white mb-6">시간대별 매출</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.salesByHour} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()}원`, "매출"]}
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 인기 메뉴 */}
          <div className="bg-[#1f2937] rounded-xl border border-white/10 p-6">
            <h3 className="text-base font-semibold text-white mb-6">인기 메뉴 TOP 4</h3>
            <div className="space-y-5">
              {stats.popularMenus.map((menu, idx) => {
                const maxCount = stats.popularMenus[0].count;
                const percentage = (menu.count / maxCount) * 100;
                return (
                  <div key={menu.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-white">{menu.name}</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400">{menu.count}건</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
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
