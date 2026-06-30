"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KioskCompleteCountdown() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    const tick = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      router.push("/kiosk/waiting");
    }
  }, [seconds, router]);

  return (
    <button
      onClick={() => router.push("/kiosk/waiting")}
      className="w-full h-14 mt-8 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center cursor-pointer"
    >
      처음으로 돌아가기 ({seconds}초)
    </button>
  );
}
