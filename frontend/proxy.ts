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

const STORE_OWNER_PATHS = ["/owner", "/table-order", "/kitchen", "/kiosk", "/pos"];

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
    return NextResponse.redirect(new URL("/login", request.url));
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
  matcher: ["/owner/:path*", "/system-admin/:path*", "/table-order/:path*", "/kitchen/:path*", "/kiosk/:path*", "/pos/:path*", "/login"],
};
