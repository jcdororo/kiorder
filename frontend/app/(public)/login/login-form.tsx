"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UtensilsCrossed } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

type DemoAccount = { email: string; password: string };

export default function LoginForm({
  demoAccount,
}: {
  demoAccount: DemoAccount | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "로그인 실패");
      }
      return res.json() as Promise<{ role: string }>;
    },
    onSuccess: (data) => {
      localStorage.setItem("role", data.role);
      // 쿠키 세팅 직후엔 hard navigation으로 이동 — soft nav(router.push)는 프록시가
      // 갱신 전 쿠키 상태를 보고 튕겨서 배포 환경(SameSite=None)에서 이동이 안 됨
      window.location.href =
        data.role === "SYSTEM_ADMIN"
          ? "/system-admin/stores"
          : "/owner/dashboard";
    },
    onError: (error: Error) =>
      toast.error(error.message || "서버 연결에 실패했습니다"),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const fillDemoAccount = () => {
    if (!demoAccount) return;
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
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

        {demoAccount && (
          <div className="mt-5 mb-6 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
              포트폴리오 테스트 계정
            </p>
            <div className="flex items-center justify-between gap-3">
              <dl className="text-sm space-y-0.5">
                <div className="flex gap-2">
                  <dt className="text-zinc-500 w-6">ID</dt>
                  <dd className="text-zinc-200 font-medium">
                    {demoAccount.email}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-zinc-500 w-6">PW</dt>
                  <dd className="text-zinc-200 font-medium">
                    {demoAccount.password}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="shrink-0 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-400 transition-colors hover:bg-orange-500/20 active:scale-95"
              >
                자동 입력
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className={`space-y-5 ${demoAccount ? "" : "mt-6"}`}
        >
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
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
