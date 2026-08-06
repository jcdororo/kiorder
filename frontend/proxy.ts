import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  userId: number;
  email: string;
  role: "SYSTEM_ADMIN" | "STORE_OWNER";
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is not defined");
const SECRET = new TextEncoder().encode(jwtSecret);

const STORE_OWNER_PATHS = ["/owner", "/table-order", "/kitchen", "/hall", "/kiosk", "/pos"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    if (token) {
      try {
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET);
        const dest = payload.role === "SYSTEM_ADMIN" ? "/system-admin/stores" : "/owner/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    // 포트폴리오 열람자가 공유받은 깊은 링크(예: /table-order/{id}/menu)로 바로 들어와도
    // 화면을 볼 수 있어야 한다. 로그인 화면으로 보내면 계정을 모르는 사람은 여기서 막힌다.
    // 자동 로그인을 거쳐 원래 가려던 곳으로 보낸다.
    // 데모 계정이 설정돼 있지 않으면 auto-login 라우트가 알아서 /login으로 폴백하고,
    // 그 경로는 이 미들웨어의 위쪽 분기에서 통과되므로 무한 루프는 생기지 않는다.
    const autoLogin = new URL("/api/auth/auto-login", request.url);
    autoLogin.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(autoLogin);
  }

  try {
    const { payload } = await jwtVerify<JwtPayload>(token, SECRET);

    if (pathname.startsWith("/system-admin") && payload.role !== "SYSTEM_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (STORE_OWNER_PATHS.some((p) => pathname.startsWith(p)) && payload.role !== "STORE_OWNER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/system-admin/:path*", "/table-order/:path*", "/kitchen/:path*", "/hall/:path*", "/kiosk/:path*", "/pos/:path*", "/login"],
};
