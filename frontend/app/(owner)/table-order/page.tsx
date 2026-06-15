import { UtensilsCrossed } from "lucide-react";
import Tables from "@/components/owner/Tables";

export default async function Page() {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-orange-500 p-2.5 rounded-xl">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <span className="text-white text-xl font-bold tracking-tight">
          Kiorder
        </span>
      </div>

      <div className="bg-[#1f2937] rounded-2xl border border-white/10 p-8 w-full max-w-md">
        <h2 className="text-white font-semibold text-lg mb-1 text-center">
          테이블 선택
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          이 태블릿의 테이블 번호를 선택하세요
        </p>
        <Tables />
      </div>
    </div>
  );
}
