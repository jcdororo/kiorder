import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KIORDER — 맛있는 식당 통합 주문 시스템",
    template: "%s | KIORDER",
  },
  description:
    "테이블오더 · 키오스크 웨이팅 · 주방/홀/POS 실시간 관리를 하나로 묶은 식당 통합 주문 플랫폼",
  // 모바일 브라우저(삼성 인터넷 등)가 화면의 전화번호를 자동으로 tel: 링크로 바꾼다.
  // 웨이팅 등록 화면에서 손님 번호를 누르면 전화가 걸리는 문제라, 마크업이 아니라
  // 여기서 자동 감지 자체를 끈다.
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
