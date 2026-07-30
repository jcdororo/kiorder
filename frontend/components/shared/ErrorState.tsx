import { AlertTriangle, RotateCcw } from "lucide-react";

// useQuery isError 시 인라인으로 표시하는 공통 에러 UI (라우트 error.tsx와 동일 톤,
// 단 Realtime 구독을 끊지 않도록 페이지 안에서 refetch만 재시도)
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">불러오지 못했습니다</h2>
        <p className="text-gray-500 text-sm mb-6">
          {message || "잠시 후 다시 시도해주세요"}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    </div>
  );
}
