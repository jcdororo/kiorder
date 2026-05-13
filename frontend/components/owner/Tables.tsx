"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Table = { id: string; number: number };

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    apiFetch("/tables")
      .then((res) => res.json())
      .then((data) => setTables(data));
  }, []);
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
