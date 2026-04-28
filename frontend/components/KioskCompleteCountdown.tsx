"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KioskCompleteCountdown() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    const tick = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          router.push("/kiosk/waiting");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [router]);

  return (
    <button
      onClick={() => router.push("/kiosk/waiting")}
      className="w-full h-14 mt-8 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center cursor-pointer"
    >
      처음으로 돌아가기 ({seconds}초)
    </button>
  );
}
