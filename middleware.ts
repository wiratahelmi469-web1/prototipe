import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Since we also support dynamic client-side auth context fallback for robust iframe compliance,
  // we let the server check layout parameters and allow initial page rendering.
  // This avoids cold-restart login locks inside embedded sandboxed previews.
  
  // Staf folder is mapped as "staff" but the role is "staff" and Staf Kemahasiswaan goes to "/dashboard/staff"
  if (pathname === "/dashboard/staf") {
    return NextResponse.redirect(new URL("/dashboard/staff", request.url));
  }

  return NextResponse.next();
}

// Route matcher configuration
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register"
  ]
};
