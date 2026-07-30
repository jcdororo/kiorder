import { Skeleton } from "./Skeleton";

// kitchen/hall 칸반 보드 초기 로딩 스켈레톤 (3열 × 카드 N개)
export function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
