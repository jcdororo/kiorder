"use client";

import { Skeleton } from "@/components/shared/Skeleton";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Table = { id: string; number: number };

export default function Tables() {
  const { data: tables = [], isPending, isError } = useQuery<Table[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const res = await apiFetch("/tables");
      if (!res.ok) throw new Error("테이블 조회 실패");
      return res.json();
    },
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <p className="text-red-400 text-center py-4">테이블을 불러오지 못했습니다.</p>;
  }

  return (
    <div>
      {tables.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          등록된 테이블이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {tables.map((table) => (
            <Link
              key={table.id}
              href={`/table-order/${table.id}/menu`}
              className="aspect-square text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white hover:bg-orange-500 hover:border-orange-500 transition-colors flex items-center justify-center"
            >
              {table.number}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
