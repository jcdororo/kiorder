"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">접근 권한이 없습니다</h1>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        뒤로가기
      </button>
    </div>
  );
}
