import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get("access_token")?.value;

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
    {
      method: "POST",
      headers: cookie ? { Cookie: `access_token=${cookie}` } : {},
    }
  );

  const response = NextResponse.json({}, { status: backendRes.status });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
