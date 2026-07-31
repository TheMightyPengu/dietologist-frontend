import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashbord")) {
    const fixedUrl = request.nextUrl.clone();
    fixedUrl.pathname = pathname.replace("/dashbord", "/dashboard");

    return NextResponse.redirect(fixedUrl);
  }

  const isLoginPage = pathname === "/dashboard/login";
  const hasAuthCookie = Boolean(
    request.cookies.get(ADMIN_TOKEN_COOKIE)?.value
  );

  // Always allow the login page.
  // Do not redirect merely because a cookie exists:
  // it might be expired, invalid, or signed with an old JWT secret.
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Basic early protection.
  if (!hasAuthCookie) {
    const loginUrl = new URL("/dashboard/login", request.url);

    loginUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashbord/:path*"],
};