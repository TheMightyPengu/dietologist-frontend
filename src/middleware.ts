import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optional: fix the common typo /dashbord -> /dashboard
  if (pathname.startsWith("/dashbord")) {
    const fixedUrl = request.nextUrl.clone();
    fixedUrl.pathname = pathname.replace("/dashbord", "/dashboard");

    return NextResponse.redirect(fixedUrl);
  }

  const isDashboardLoginPage = pathname === "/dashboard/login";
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  // Allow the login page when not logged in.
  if (isDashboardLoginPage) {
    // If already logged in, do not show login again.
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Protect every other dashboard page.
  if (!token) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashbord/:path*"],
};