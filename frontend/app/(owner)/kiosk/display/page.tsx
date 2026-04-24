"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { WaitingItem } from "@/types/types";

const mockWaitingList: WaitingItem[] = [
  {
    id: "1",
    waitingNumber: 8,
    phoneNumber: "010-1234-5678",
    partySize: 4,
    status: "WAITING",
    createdAt: new Date("2026-04-14T11:30:00"),
  },
  {
    id: "2",
    waitingNumber: 9,
    phoneNumber: "010-2345-6789",
    partySize: 2,
    status: "WAITING",
    createdAt: new Date("2026-04-14T11:35:00"),
  },
  {
    id: "3",
    waitingNumber: 10,
    phoneNumber: "010-3456-7890",
    partySize: 3,
    status: "CALLED",
    createdAt: new Date("2026-04-14T11:40:00"),
    calledAt: new Date("2026-04-14T11:55:00"),
  },
  {
    id: "4",
    waitingNumber: 11,
    phoneNumber: "010-4567-8901",
    partySize: 2,
    status: "WAITING",
    createdAt: new Date("2026-04-14T11:45:00"),
  },
  {
    id: "5",
    waitingNumber: 12,
    phoneNumber: "010-5678-9012",
    partySize: 6,
    status: "WAITING",
    createdAt: new Date("2026-04-14T11:50:00"),
  },
];

export default function Page() {
  const waitingList = mockWaitingList.filter(
    (item) => item.status === "WAITING" || item.status === "CALLED",
  );
  const currentlyCalledNumber = waitingList.find(
    (item) => item.status === "CALLED",
  )?.waitingNumber;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="mb-2">대기 현황</h1>
          <p className="text-muted-foreground">실시간으로 업데이트됩니다</p>
        </div>

        {/* 현재 호출 번호 */}
        {currentlyCalledNumber && (
          <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl shadow-lg p-8 mb-6 text-white text-center animate-pulse">
            <div className="text-lg mb-2 opacity-90">현재 호출 중</div>
            <div className="text-6xl font-bold mb-2">
              {currentlyCalledNumber}번
            </div>
            <div className="text-lg opacity-90">입장해 주세요</div>
          </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Users className="w-5 h-5" />
              <span>대기팀</span>
            </div>
            <div className="text-4xl font-bold text-primary">
              {waitingList.length}
            </div>
            <div className="text-sm text-muted-foreground">팀</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-5 h-5" />
              <span>평균 대기시간</span>
            </div>
            <div className="text-4xl font-bold text-primary">15</div>
            <div className="text-sm text-muted-foreground">분</div>
          </div>
        </div>

        {/* 대기 목록 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-orange-50 px-6 py-4 border-b">
            <h3 className="m-0">대기 목록</h3>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {waitingList.map((item) => {
              const waitTime = Math.floor(
                (new Date().getTime() - item.createdAt.getTime()) / 60000,
              );

              return (
                <div
                  key={item.id}
                  className={`px-6 py-5 flex items-center justify-between ${
                    item.status === "CALLED" ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-3xl font-bold ${
                        item.status === "CALLED"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.waitingNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{item.partySize}명</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{waitTime}분 대기 중</span>
                      </div>
                    </div>
                  </div>
                  {item.status === "CALLED" && (
                    <div className="bg-primary text-white px-4 py-2 rounded-lg font-medium">
                      호출됨
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href="/kiosk/waiting"
          className="block w-full mt-6 py-4 bg-primary text-white rounded-xl text-center hover:bg-primary/90 transition-colors no-underline"
        >
          웨이팅 등록하기
        </Link>
      </div>
    </div>
  );
}
