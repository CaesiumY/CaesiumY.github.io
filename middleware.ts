import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(request: NextRequest) {
  const {
    os: { name: osName },
  } = userAgent(request);

  const response = NextResponse.next();

  if (osName) response.cookies.set("os", osName);

  return response;
}
