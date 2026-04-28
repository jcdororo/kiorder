"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Users, RefreshCw } from "lucide-react";

type WaitingEntry = {
  id: string;
  number: number;
  status: "대기중" | "호출중" | "입장완료" | "취소";
  partySize: number;
  phone: string;
  ahead: number;
  guestResponse: string | null;
};

const STATUS_LABEL: Record<WaitingEntry["status"], string> = {
  대기중: "대기 중",
  호출중: "고객님 차례입니다. 입장해주세요 !",
  입장완료: "입장 완료",
  취소: "취소됨",
};

const STATUS_COLOR: Record<WaitingEntry["status"], string> = {
  대기중: "text-orange-500",
  호출중: "text-yellow-400",
  입장완료: "text-green-500",
  취소: "text-gray-500",
};

export default function Page() {
  const { waitingId } = useParams<{ waitingId: string }>();
  const [entry, setEntry] = useState<WaitingEntry | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [isCooldown, setIsCooldown] = useState(false);
  const [responded, setResponded] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting/status/${waitingId}`,
      );
      if (res.ok) setEntry(await res.json());
    } catch {}
  };

  const fetchRef = useRef(fetchStatus);
  useEffect(() => {
    fetchRef.current = fetchStatus;
  });

  useEffect(() => {
    fetchRef.current();
    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchRef.current();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleGuestResponse = async (response: "가고있어요" | "10분 늦어요") => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting/${waitingId}/guest-response`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      },
    );
    setResponded(true);
  };

  const handleGuestCancel = async () => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting/${waitingId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "취소" }),
      },
    );
    fetchRef.current();
  };

  const handleRefresh = () => {
    if (isCooldown) return;
    fetchRef.current();
    setCountdown(15);
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 1000);
  };

  if (!entry) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 flex items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (entry.status === "입장완료" || entry.status === "취소") {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p
            className={`text-2xl font-bold mb-2 ${STATUS_COLOR[entry.status]}`}
          >
            {STATUS_LABEL[entry.status]}
          </p>
          <p className="text-gray-500 text-sm">만료된 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-md mx-auto">
        <h1 className="text-xl text-white">실시간 대기 현황</h1>

        <div className="flex items-center gap-4">
          <p className="text-7xl font-bold text-orange-500">{entry.number}번</p>
          <button
            onClick={handleRefresh}
            disabled={isCooldown}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-300 mb-0.5" />
            <span className="text-xs text-gray-400">{countdown}s</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 w-full space-y-4 text-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">상태</p>
            <p
              className={`text-lg font-semibold ${STATUS_COLOR[entry.status]}`}
            >
              {STATUS_LABEL[entry.status]}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">앞 대기</p>
            <p className="text-2xl font-bold text-white">
              {entry.ahead === 0 ? (
                <span className="text-green-400">곧 입장이에요!</span>
              ) : (
                <>{entry.ahead}팀</>
              )}
            </p>
          </div>
          <div className="flex justify-center gap-1 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{entry.partySize}인</span>
          </div>
        </div>

        {(entry.status === "호출중" || entry.ahead <= 3) && (
          <div className="w-full space-y-3">
            {responded || entry.guestResponse ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                <p className="text-green-400 font-semibold">
                  {entry.guestResponse ?? "응답이 전송되었습니다"}
                </p>
                <p className="text-gray-500 text-sm mt-1">사장님께 전달됐어요</p>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-400 text-sm">입장 여부를 알려주세요</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGuestResponse("가고있어요")}
                    className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors cursor-pointer"
                  >
                    가고있어요
                  </button>
                  <button
                    onClick={() => handleGuestResponse("10분 늦어요")}
                    className="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors cursor-pointer"
                  >
                    10분 늦어요
                  </button>
                </div>
                <button
                  onClick={handleGuestCancel}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 font-semibold transition-colors border border-white/10 cursor-pointer"
                >
                  취소할게요
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
          <Clock className="w-3 h-3" />
          <span>{countdown}초 후 자동 갱신</span>
        </div>
      </div>
    </div>
  );
}
