import Link from "next/link";
import {
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Store,
  Users,
} from "lucide-react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export default async function Page() {
  const sections = [
    {
      title: "키오스크 (손님용)",
      icon: Users,
      color: "bg-blue-500",
      links: [
        { name: "웨이팅 등록", path: "/kiosk/waiting" },
      ],
    },
    {
      title: "테이블오더 (손님용)",
      icon: UtensilsCrossed,
      color: "bg-orange-500",
      links: [
        { name: "테이블 선택", path: "/table-order" },
        { name: "주문 내역 - 테이블 3", path: "/table-order/order-history" },
      ],
    },
    {
      title: "주방 (직원용)",
      icon: ChefHat,
      color: "bg-red-500",
      links: [{ name: "주문 관리", path: "/kitchen/orders" }],
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
        { name: "테이블 레이아웃 설정", path: "/owner/table-settings" },
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

  let email = "";
  try {
    const token = (await cookies()).get("access_token")?.value;
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify<{ email: string }>(token, secret);
      email = payload.email;
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#111827] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pt-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2.5 rounded-xl">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">맛있는 식당</span>
          </div>
          {email && (
            <p className="text-zinc-400 text-sm">안녕하세요 <span className="text-white font-medium">{email}</span>님</p>
          )}
        </div>

        {/* Section grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-[#1f2937] rounded-xl border border-white/10 p-6"
              >
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

        <p className="text-white/20 text-xs text-center mt-12">© 2026 맛있는 식당. All rights reserved.</p>
      </div>
    </div>
  );
}
