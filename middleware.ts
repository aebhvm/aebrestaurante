import { NextRequest, NextResponse } from "next/server";
import { canAccess, dashboardForRole } from "@/lib/permissions";
import { cookieName, verifySessionToken } from "@/lib/session-core";

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(cookieName)?.value);
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (!canAccess(pathname, session.role)) {
    return NextResponse.redirect(new URL(dashboardForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
