import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectTo = searchParams.get("redirectTo") || "/owner/dashboard";

  // open redirect 방지
  if (!redirectTo.startsWith("/")) {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  // 이미 쿠키 있으면 바로 redirect
  const existingToken = request.cookies.get("access_token")?.value;
  if (existingToken) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
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
