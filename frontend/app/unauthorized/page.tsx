"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111827]">
      <div className="flex flex-col gap-2 bg-[#1f2937] items-center justify-center p-14 rounded-2xl">
        <h1 className="text-2xl font-bold text-white">접근 권한이 없습니다</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2  text-gray-400 rounded hover:bg-gray-700 cursor-pointer"
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}
