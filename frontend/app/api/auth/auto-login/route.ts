import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectTo = searchParams.get("redirectTo") || "/owner/dashboard";

  // open redirect 방지
  if (!redirectTo.startsWith("/")) {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  // 이미 유효한 쿠키가 있으면 백엔드를 다시 부르지 않는다.
  // 존재 여부만 확인하면, 만료됐거나 예전 JWT_SECRET으로 서명된 쿠키가 남아 있을 때
  // 그대로 통과시켜 proxy.ts가 /login으로 튕긴다. 사용자 입장에서는 자동 로그인을
  // 눌렀는데 로그인 화면이 뜨고, 쿠키를 직접 지우기 전까지 영영 반복된다.
  const existingToken = request.cookies.get("access_token")?.value;
  const jwtSecret = process.env.JWT_SECRET;
  if (existingToken && jwtSecret) {
    try {
      await jwtVerify(existingToken, new TextEncoder().encode(jwtSecret));
      return NextResponse.redirect(new URL(redirectTo, request.url));
    } catch {
      // 무효한 토큰이면 아래로 내려가 다시 로그인한다.
      // 새로 받은 Set-Cookie가 썩은 쿠키를 덮어쓴다.
    }
  }

  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!backendRes.ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const setCookie = backendRes.headers.get("set-cookie");
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }
  return response;
}
