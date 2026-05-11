"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-500 text-sm mb-6">{error.message || "잠시 후 다시 시도해주세요"}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    </div>
  );
}
