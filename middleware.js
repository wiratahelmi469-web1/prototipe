// SECTION: Navigation Route Guards Middleware
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read the currentUser cookie
  const userCookie = request.cookies.get("currentUser")?.value;
  let user = null;

  if (userCookie) {
    try {
      // Decode with safety
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch (e) {
      // Fail outer parse silently
    }
  }

  // PUBLIC ROUTES (Splash, Events lists & details)
  if (pathname === "/" || pathname === "/events" || pathname.startsWith("/events/")) {
    return NextResponse.next();
  }

  // LOGIN PAGE GATE
  if (pathname === "/login") {
    if (user && user.isLoggedIn) {
      return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url));
    }
    return NextResponse.next();
  }

  // AUTH REQUIRED GATES (/profile, /dashboard/*)
  if (!user || !user.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ROLE SPECIFIC GATE for /dashboard/[role]
  if (pathname.startsWith("/dashboard/")) {
    const segments = pathname.split("/");
    const expectedRole = segments[2]; // /dashboard/role/something -> index 2 is 'role'

    if (expectedRole && expectedRole !== user.role) {
      // If of a different role, fallback to proper dashboard
      return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/profile",
    "/dashboard/:path*",
  ],
};
