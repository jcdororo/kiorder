"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackToTour } from "@/components/shared/BackToTour";
import { PhoneCall, UtensilsCrossed } from "lucide-react";

interface OwnerSidebarProps {
  active: "menu" | "waiting";
}

export function OwnerSidebar({ active }: OwnerSidebarProps) {
  const router = useRouter();

  const isMenu = active === "menu";
  const subtitle = isMenu ? "메뉴 관리" : "웨이팅 관리";
  const mobileLinkLabel = isMenu ? "웨이팅" : "메뉴";
  const otherPagePath = isMenu ? "/owner/waiting" : "/owner/menu";

  return (
    <>
      {/* Mobile Header — 목록이 길어 스크롤해도 "홈으로"가 남아 있어야 하므로 상단 고정 */}
      <div className="md:hidden sticky top-0 z-20 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        {/* 뒤로가기는 좌측 상단이 관습이다. 데스크톱 사이드바와도 위치를 맞춘다. */}
        <div className="flex items-center gap-2 min-w-0">
          <BackToTour
            variant="icon"
            className="-ml-1 p-1.5 rounded-md hover:bg-white/10"
          />
          <div className="min-w-0">
            <h1 className="text-white font-semibold truncate">맛있는 식당</h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
          onClick={() => router.push(otherPagePath)}
        >
          {mobileLinkLabel}
        </Button>
      </div>

      {/* Sidebar — 태블릿: 아이콘만(w-14), PC: 전체(w-60)
          h-screen + sticky: 높이를 두지 않으면 사이드바가 본문(메뉴 40여 개) 높이만큼
          늘어나 통째로 스크롤돼 사라진다. 화면 높이로 묶어야 본문만 스크롤된다. */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-14 lg:w-60 shrink-0 bg-gray-900 border-r border-white/10 md:p-2 lg:p-4 flex-col">
        {/* 나머지 7개 화면과 같은 컴포넌트를 쓴다. 손으로 짠 링크를 두면
            아이콘과 라벨이 화면마다 갈라져 "홈으로"인지 "뒤로가기"인지 헷갈린다.
            md의 아이콘 레일(w-14)에서는 라벨이 sr-only가 되어야 하므로 responsive. */}
        <BackToTour
          variant="responsive"
          className="w-full justify-center lg:justify-start px-2 lg:px-4 py-2 rounded-md hover:bg-white/10"
        />

        <div className="mt-6 mb-8 hidden lg:block">
          <h1 className="text-xl text-white mb-1">맛있는 식당</h1>
          <p className="text-sm text-gray-500">관리자</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant="ghost"
            className={
              isMenu
                ? "w-full justify-center lg:justify-start text-gray-400 hover:text-white hover:bg-white/10 px-2 lg:px-4"
                : "w-full justify-center lg:justify-start bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-2 lg:px-4"
            }
            onClick={isMenu ? () => router.push("/owner/waiting") : undefined}
          >
            <PhoneCall className="w-4 h-4 shrink-0 lg:mr-2" />
            <span className="hidden lg:inline">웨이팅 관리</span>
          </Button>
          <Button
            variant="ghost"
            className={
              isMenu
                ? "w-full justify-center lg:justify-start bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-2 lg:px-4"
                : "w-full justify-center lg:justify-start text-gray-400 hover:text-white hover:bg-white/10 px-2 lg:px-4"
            }
            onClick={isMenu ? undefined : () => router.push("/owner/menu")}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0 lg:mr-2" />
            <span className="hidden lg:inline">메뉴 관리</span>
          </Button>
        </nav>
      </div>
    </>
  );
}
