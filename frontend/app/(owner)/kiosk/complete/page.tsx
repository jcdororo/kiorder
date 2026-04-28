import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import QrCode from "@/components/QrCode";
import KioskCompleteCountdown from "@/components/KioskCompleteCountdown";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/waiting/status/${id}`,
    { cache: "no-store" },
  );
  const entry = await res.json();
  const statusUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/waiting/${id}`;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 flex flex-col p-8">
      <div className="flex-1 flex flex-row gap-8 items-center">
        {/* 왼쪽: 등록 완료 + 대기번호 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
          <h1 className="text-3xl text-white">대기 등록 완료!</h1>
          <div className="w-full p-8 rounded-2xl border-2 border-orange-500 bg-gray-800 text-center">
            <p className="text-sm text-gray-400 mb-3">내 대기번호</p>
            <p className="text-8xl text-orange-500">{entry.number}번</p>
          </div>
        </div>

        {/* 오른쪽: QR코드 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-full bg-gray-800 rounded-2xl p-8 text-center">
            <p className="text-white text-lg mb-2">대기 현황 확인</p>
            <p className="text-sm text-gray-400 mb-6">
              QR코드를 스캔하면 실시간으로 대기 순서를 확인할 수 있어요
            </p>
            <Link href={statusUrl} className="flex justify-center">
              <QrCode value={statusUrl} />
            </Link>
          </div>
        </div>
      </div>

      <KioskCompleteCountdown />
    </div>
  );
}
