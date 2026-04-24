import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const myNumber = 23;
  const currentNumber = 18;

  const waitingList = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    status: i < 18 ? "입장완료" : i === 18 ? "호출됨" : "대기중",
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA] max-w-[390px] mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg text-[#111827]">맛있는 식당</h1>
            <p className="text-sm text-[#6B7280]">실시간 대기 현황</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Current Number Card */}
        <Card className="bg-[#F97316] border-none text-white p-6">
          <p className="text-sm mb-2">지금 입장 중</p>
          <p className="text-7xl text-center py-4">{currentNumber}번</p>
        </Card>

        {/* My Number Card */}
        <Card className="border-2 border-[#F97316] p-6">
          <p className="text-sm text-[#6B7280] mb-2">내 대기번호</p>
          <p className="text-5xl text-center py-2 text-[#F97316] mb-2">
            {myNumber}번
          </p>
          <p className="text-base text-[#6B7280] text-center">
            앞에 {myNumber - currentNumber - 1}팀 남았어요
          </p>
        </Card>

        {/* Waiting List */}
        <div className="flex-1">
          <h3 className="text-sm mb-3 text-[#6B7280]">대기 목록</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {waitingList.map((item) => (
                <div
                  key={item.number}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    item.number === myNumber
                      ? "bg-[#F97316]/10 border-2 border-[#F97316]"
                      : "bg-white border border-[#E5E7EB]"
                  }`}
                >
                  <span
                    className={`text-lg ${item.number === myNumber ? "text-[#F97316]" : "text-[#111827]"}`}
                  >
                    {item.number}번
                  </span>
                  <Badge
                    variant={
                      item.status === "입장완료"
                        ? "secondary"
                        : item.status === "호출됨"
                          ? "default"
                          : "outline"
                    }
                    className={
                      item.status === "입장완료"
                        ? "bg-gray-200 text-gray-700"
                        : item.status === "호출됨"
                          ? "bg-[#FACC15] text-[#111827]"
                          : "border-[#E5E7EB]"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Real-time Indicator */}
        <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg border border-[#E5E7EB]">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
          <span className="text-sm text-[#6B7280]">실시간 연결됨</span>
        </div>
      </div>
    </div>
  );
}
