/**
 * Batman AI - Auth Middleware
 * Protect dashboard/chat/profile routes.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/chat", "/profile"];

export function middleware(request: NextRequest) {
  // Client-side auth check is handled by useSession hook
  // This middleware is a placeholder for SSR auth if needed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/profile/:path*"],
};
