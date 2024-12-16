import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { accessToken } from "./constants";
import { cookies } from "next/headers";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = cookies();
  const verifyCookie = cookieStore.get(accessToken);

  if (pathname.startsWith("/_next")) return NextResponse.next();

  if (!verifyCookie && !pathname.startsWith("/auth")) {
    if (pathname === "/") {
      NextResponse.next();
    } else {
      req.nextUrl.pathname = "/auth/login";
      return NextResponse.redirect(req.nextUrl);
    }
  }

  if (
    (verifyCookie && pathname.startsWith("/auth")) ||
    (verifyCookie && pathname === "/")
  ) {
    req.nextUrl.pathname = "/new-document";
    return NextResponse.redirect(req.nextUrl);
  }
}

export const config = {
  matcher: [
    "/",
    "/new-document",
    "/auth/login",
    "/auth/signup",
    "/questions/:path",
    "/documents/:path",
    "/account/profile",
    "/account/settings"
  ],
};
