import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await backendRes.json();
  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
