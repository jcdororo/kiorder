import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  userId: number;
  email: string;
  role: "SYSTEM_ADMIN" | "STORE_OWNER";
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 통과
  if (pathname.startsWith("/login")) {
    if (token)
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    return NextResponse.next();
  }

  // 토큰 없으면 로그인으로
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify<JwtPayload>(token, secret);

    // role 기반 접근 제어
    if (
      pathname.startsWith("/system-admin") &&
      payload.role !== "SYSTEM_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (pathname.startsWith("/owner") && payload.role !== "STORE_OWNER") {
      return NextResponse.redirect(new URL("unauthorized", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/system-admin/:path*", "/login"],
};
