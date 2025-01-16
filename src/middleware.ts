import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!token && (request.nextUrl.pathname.startsWith("/analyze") || request.nextUrl.pathname.startsWith("/community"))) {
    const url = new URL(`/login`, request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    return NextResponse.redirect(new URL(callbackUrl || "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/analyze/:path*", "/community/:path*", "/login"]
}; 