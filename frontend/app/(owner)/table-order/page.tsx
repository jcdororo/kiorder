"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Table = { id: string; number: number };

export default function Page() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/tables")
      .then((res) => res.json())
      .then((data) => setTables(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <p className="text-gray-400">로딩 중...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-orange-500 p-2.5 rounded-xl">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <span className="text-white text-xl font-bold tracking-tight">맛있는 식당</span>
      </div>

      <div className="bg-[#1f2937] rounded-2xl border border-white/10 p-8 w-full max-w-md">
        <h2 className="text-white font-semibold text-lg mb-1 text-center">테이블 선택</h2>
        <p className="text-gray-400 text-sm text-center mb-6">이 태블릿의 테이블 번호를 선택하세요</p>

        {tables.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 테이블이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => router.push(`/table-order/${table.id}/menu`)}
                className="aspect-square text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white hover:bg-orange-500 hover:border-orange-500 transition-colors"
              >
                {table.number}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
