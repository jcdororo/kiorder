import Link from "next/link";
import {
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Store,
  Users,
  ConciergeBell,
} from "lucide-react";

const flowSteps = [
  { emoji: "📱", label: "손님 주문/웨이팅", hasArrow: true },
  { emoji: "⚡", label: "실시간 반영", hasArrow: true },
  { emoji: "👨‍🍳", label: "주방 · 홀 처리", hasArrow: true },
  { emoji: "📊", label: "사장님 대시보드", hasArrow: false },
];

const features = [
  {
    icon: "🔔",
    bg: "bg-blue-600/20",
    title: "실시간 웨이팅",
    desc: "터치 키패드로 전화번호와 인원수만 입력하면 QR 대기표가 발급되고, 대기 현황이 15초마다 자동 갱신됩니다.",
  },
  {
    icon: "🍜",
    bg: "bg-orange-500/20",
    title: "테이블오더",
    desc: "테이블마다 고유 링크로 메뉴를 조회하고, 장바구니에 담아 바로 주문을 제출할 수 있습니다.",
  },
  {
    icon: "🧑‍🍳",
    bg: "bg-red-500/20",
    title: "주방 실시간 칸반",
    desc: "새 주문이 폴링 없이 즉시 칸반 보드에 뜨고, 조리 시간이 15분을 넘으면 타이머가 붉게 경고합니다.",
  },
  {
    icon: "📋",
    bg: "bg-green-500/20",
    title: "메뉴 · 웨이팅 관리",
    desc: "판매중/품절 토글, 카테고리 필터, 대기열 호출과 입장 처리까지 한 화면에서 관리합니다.",
  },
];

const devices = [
  {
    isLaptop: false,
    icon: "🍽️",
    screenBg: "bg-orange-500/20",
    device: "테이블 위 태블릿",
    title: "테이블오더 화면",
    desc: "테이블에 놓인 태블릿으로 로그인하면 메뉴판이 뜨고, 바로 주문을 받습니다.",
  },
  {
    isLaptop: false,
    icon: "🙋",
    screenBg: "bg-blue-600/20",
    device: "입구 거치용 태블릿",
    title: "웨이팅 키오스크 화면",
    desc: "입구에 놓인 큰 태블릿으로 같은 계정으로 들어가면 웨이팅 접수 키오스크가 됩니다.",
  },
  {
    isLaptop: false,
    icon: "👨‍🍳",
    screenBg: "bg-red-500/20",
    device: "주방 태블릿",
    title: "주문현황 모니터",
    desc: "주방장이 주문관리 화면으로 들어가면 실시간 주문 현황판으로 바뀝니다.",
  },
  {
    isLaptop: true,
    icon: "📊",
    screenBg: "bg-emerald-500/20",
    device: "사장님 노트북",
    title: "매장 관리 대시보드",
    desc: "오너가 노트북으로 로그인하면 메뉴·웨이팅·주문을 한눈에 관리합니다.",
  },
];

const techBadges = ["Next.js", "NestJS", "TypeScript", "Prisma", "Supabase Realtime"];

const sections = [
  {
    title: "키오스크 (손님용)",
    icon: Users,
    color: "bg-blue-500",
    links: [{ name: "웨이팅 등록", path: "/kiosk/waiting" }],
  },
  {
    title: "테이블오더 (손님용)",
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    links: [{ name: "테이블 선택", path: "/table-order" }],
  },
  {
    title: "주방 (직원용)",
    icon: ChefHat,
    color: "bg-red-500",
    links: [{ name: "주문 관리", path: "/kitchen/orders" }],
  },
  {
    title: "홀 (직원용)",
    icon: ConciergeBell,
    color: "bg-sky-500",
    links: [{ name: "홀 주문 관리", path: "/hall/orders" }],
  },
  {
    title: "포스기 (직원용)",
    icon: CreditCard,
    color: "bg-purple-500",
    links: [{ name: "결제 화면", path: "/pos" }],
  },
  {
    title: "관리자 (사장님용)",
    icon: LayoutDashboard,
    color: "bg-emerald-500",
    links: [
      { name: "대시보드", path: "/owner/dashboard" },
      { name: "웨이팅 관리", path: "/owner/waiting" },
      { name: "메뉴 관리", path: "/owner/menu" },
    ],
  },
  {
    title: "시스템 어드민",
    icon: Store,
    color: "bg-zinc-500",
    links: [
      { name: "매장 관리", path: "/system-admin/stores" },
      { name: "로그인", path: "/login" },
    ],
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAV */}
      <div className="sticky top-0 z-20 bg-gray-950/85 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-extrabold text-base">
              K
            </div>
            <span className="text-lg font-bold tracking-tight">KiOrder</span>
          </div>
          <div className="flex items-center gap-5 sm:gap-7">
            <a href="#features" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">
              핵심 기능
            </a>
            <a href="#roles" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">
              화면 소개
            </a>
            <a href="#demo" className="hidden sm:inline text-sm font-medium text-gray-400 hover:text-white transition-colors">
              데모
            </a>
            <a href="#screens" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              화면 둘러보기
            </a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[13px] font-semibold px-3.5 py-1.5 rounded-full mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          식당 사장님을 위한 올인원 주문 · 웨이팅 SaaS
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.15] tracking-tight mb-6">
          테이블오더와 키오스크 웨이팅,
          <br />
          이제 <span className="text-orange-400">하나의 화면</span>에서 관리하세요
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed max-w-[620px] mx-auto mb-10">
          손님의 주문과 웨이팅이 실시간으로 주방과 홀에 그대로 반영됩니다. 폴링도,
          새로고침도 필요 없습니다.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <a href="#screens" className="bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold px-7 py-3.5 rounded-xl transition-colors">
            화면 둘러보기 →
          </a>
          <Link href="/login" className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-base font-semibold px-7 py-3.5 rounded-xl transition-colors no-underline">
            로그인
          </Link>
        </div>
        <p className="text-[13px] text-gray-500 mt-[18px]">
          테스트 계정 &nbsp;ID: owner1@test.com &nbsp;·&nbsp; PW: test1234
        </p>
      </div>

      {/* SERVICE FLOW STRIP */}
      <div className="max-w-6xl mx-auto mb-24 px-6">
        <div className="bg-gray-800 border border-white/10 rounded-2xl px-8 py-7 flex items-center justify-around gap-4 flex-wrap">
          {flowSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2 min-w-[92px]">
                <div className="text-[22px]">{step.emoji}</div>
                <div className="text-[13px] text-gray-300 font-semibold text-center">
                  {step.label}
                </div>
              </div>
              {step.hasArrow && <div className="text-gray-600 text-xl">→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="max-w-6xl mx-auto px-6 pb-24 scroll-mt-20">
        <div className="text-center mb-14">
          <div className="text-[13px] font-bold text-orange-500 tracking-wider uppercase mb-3">
            핵심 기능
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            운영에 꼭 필요한 것만, 실시간으로
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-800 border border-white/10 rounded-2xl p-7">
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center text-xl mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ONE PLATFORM, MANY DEVICES */}
      <div id="roles" className="bg-gray-900 border-y border-white/10 py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-2">
            <div className="text-[13px] font-bold text-orange-500 tracking-wider uppercase mb-3">
              하나의 플랫폼
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3.5">
              로그인 한 번이면, 어떤 기기든 그 자리의 화면이 됩니다
            </h2>
            <p className="text-base text-gray-400 max-w-[620px] mx-auto">
              매장에 놓인 태블릿과 사장님 노트북 — 같은 KiOrder 계정으로 로그인해서,
              놓인 위치와 역할에 맞는 화면으로 바로 전환됩니다.
            </p>
          </div>

          <div className="text-center mt-11">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-bold px-4.5 py-2 rounded-full">
              <span className="w-[18px] h-[18px] rounded-md bg-orange-500 inline-flex items-center justify-center text-[10px] font-extrabold text-white">
                K
              </span>
              한 번의 로그인 · KiOrder 계정
            </div>
            <div className="w-0.5 h-7 bg-white/15 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 border-t-2 border-white/15 pt-7">
            {devices.map((d) => (
              <div key={d.title} className="text-center">
                <div className="max-w-[190px] mx-auto flex flex-col justify-center">
                  {d.isLaptop ? (
                    <div>
                      <div className="bg-gray-700 border border-white/15 rounded-t-[10px] rounded-b aspect-[16/11] p-2 flex items-center justify-center">
                        <div className={`w-full h-full ${d.screenBg} rounded flex items-center justify-center text-[26px]`}>
                          {d.icon}
                        </div>
                      </div>
                      <div className="h-3 bg-gray-600 rounded-b-lg mx-[3px] relative">
                        <div className="w-9 h-[3px] bg-gray-500 rounded-full absolute left-1/2 top-1 -translate-x-1/2" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700 border-2 border-white/15 rounded-2xl aspect-[3/4] p-2.5 flex flex-col items-center">
                      <div className="w-6 h-[3px] bg-gray-500 rounded-full mb-1.5" />
                      <div className={`flex-1 w-full ${d.screenBg} rounded-lg flex items-center justify-center text-3xl`}>
                        {d.icon}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4.5">
                  <div className="inline-block whitespace-nowrap text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2.5 py-0.5 rounded-full mb-2.5">
                    {d.device}
                  </div>
                  <div className="text-base font-bold mb-1.5">{d.title}</div>
                  <div className="text-[13px] text-gray-400 leading-normal">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEMO GIFS */}
      <div id="demo" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-20">
        <div className="text-center mb-14">
          <div className="text-[13px] font-bold text-orange-500 tracking-wider uppercase mb-3">
            데모
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            실제 매장에서 이렇게 작동합니다
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-white/10 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/GIF-1.gif"
              alt="테이블오더 주문이 주방 화면에 실시간으로 반영되는 데모"
              className="w-full block bg-gray-950"
            />
            <div className="px-[22px] py-5">
              <div className="text-base font-bold mb-1.5">테이블오더 → 주방 실시간 반영</div>
              <div className="text-sm text-gray-400 leading-normal">
                손님이 테이블오더로 주문을 넣으면, 폴링 없이 주방 칸반 보드에 즉시 반영됩니다.
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-white/10 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/GIF-2.gif"
              alt="키오스크 웨이팅 등록부터 손님 호출까지의 풀플로우 데모"
              className="w-full block bg-gray-950"
            />
            <div className="px-[22px] py-5">
              <div className="text-base font-bold mb-1.5">키오스크 웨이팅 풀플로우</div>
              <div className="text-sm text-gray-400 leading-normal">
                웨이팅 등록 → QR 대기표 발급 → 대기현황 확인 → 호출 → 응답까지 전 과정이 실시간으로 연결됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 화면 둘러보기 (기존 네비게이션 허브 병합) */}
      <div id="screens" className="bg-gray-900 border-y border-white/10 py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-[13px] font-bold text-orange-500 tracking-wider uppercase mb-3">
              화면 둘러보기
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3.5">
              16개 화면을 직접 눌러보세요
            </h2>
            <p className="text-base text-gray-400 max-w-[620px] mx-auto">
              역할별 화면으로 바로 이동합니다. 로그인이 필요한 화면은 위 테스트 계정을 사용하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-gray-800 rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${section.color} p-2.5 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="m-0 text-white text-base font-semibold">{section.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.path}
                        href={link.path}
                        className="block px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white no-underline text-sm"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-linear-to-br from-gray-800 to-gray-900 border border-orange-500/25 rounded-[20px] px-10 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3.5">지금 바로 체험해보세요</h2>
          <p className="text-base text-gray-400 mb-8">
            회원가입 없이 테스트 계정으로 전체 기능을 둘러볼 수 있습니다.
          </p>
          <a href="#screens" className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-colors">
            화면 둘러보기 →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center font-extrabold text-xs">
              K
            </div>
            <span className="text-sm font-semibold text-gray-300">KiOrder</span>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {techBadges.map((t) => (
              <span key={t} className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">© 2026 KiOrder. Made by jcdororo.</span>
        </div>
      </div>
    </div>
  );
}
