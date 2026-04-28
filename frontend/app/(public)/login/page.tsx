"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UtensilsCrossed } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "로그인 실패");
        return;
      }

      const data = await res.json();
      localStorage.setItem("role", data.role);

      if (data.role === "SYSTEM_ADMIN") {
        router.push("/system-admin/stores");
      } else {
        router.push("/owner/dashboard");
      }
    } catch {
      toast.error("서버 연결에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* 왼쪽 로그인 폼 */}
      <div className="w-full md:w-[480px] flex flex-col justify-center px-14 py-12 bg-zinc-900">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-orange-500 p-2.5 rounded-xl">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">
            맛있는 식당
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">로그인</h1>
        <p className="text-zinc-400 text-sm mb-8">
          관리자 계정으로 로그인하세요
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300 text-sm">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>

      {/* 오른쪽 배너 */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-zinc-950 p-12 gap-8">
        <div className="w-full max-w-md rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-70">
              공지사항
            </p>
            <h2 className="text-2xl font-bold mb-2">v2.0 업데이트 안내</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              테이블오더 실시간 알림 기능이 추가되었습니다.
              <br />
              키오스크 대기 화면 UI가 개선되었습니다.
            </p>
          </div>
          <div className="p-6 space-y-3">
            {[
              "실시간 주문 알림 (Supabase Realtime)",
              "매장별 메뉴 관리 기능 강화",
              "POS 결제 흐름 최적화",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 text-xs text-center">
          © 2026 맛있는 식당. All rights reserved.
        </p>
      </div>
    </div>
  );
}
