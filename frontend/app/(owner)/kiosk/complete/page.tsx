import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function Page() {
  const qrPattern = [
    1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0,
    1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0,
    0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1,
  ];
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col max-w-[390px] mx-auto p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-[#22C55E]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl mb-8 text-[#111827]">대기 등록 완료!</h1>

        {/* Waiting Number Card */}
        <Card className="w-full p-6 mb-8 border-2 border-[#F97316] bg-white">
          <div className="text-center">
            <p className="text-sm text-[#6B7280] mb-2">내 대기번호</p>
            <p className="text-6xl mb-4 text-[#F97316]">23번</p>
            <p className="text-sm text-[#6B7280]">현재 입장 중: 18번</p>
          </div>
        </Card>

        {/* QR Code Section */}
        <div className="w-full text-center mb-6">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] inline-block mb-4">
            {/* QR Code Placeholder */}
            <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="grid grid-cols-8 gap-1">
                {qrPattern.map((isBlack, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${isBlack ? "bg-black" : "bg-white"}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-[#6B7280] px-4">
            QR코드를 스캔하면
            <br />
            실시간 대기 현황을 확인할 수 있어요
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <Link href="/kiosk/waiting" className="w-full">
        <Button variant="outline" className="w-full h-14 border-[#E5E7EB]">
          처음으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}
