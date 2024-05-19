import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { accessToken } from "./constants";

export function middleware(req: NextRequest) {
  // const { pathname } = req.nextUrl;
  // const verifyCookie = req.cookies.get(accessToken);

  // if (pathname.startsWith("/_next")) return NextResponse.next();

  // if(!verifyCookie && !pathname.startsWith("/auth")){
  //   req.nextUrl.pathname = "/auth/login"
  //   return NextResponse.redirect(req.nextUrl);
  // }

  // if(verifyCookie && pathname.startsWith("/auth")) {
  //   req.nextUrl.pathname = "/"
  //   return NextResponse.redirect(req.nextUrl);
  // }
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/auth/signup",
    "/questions/:path",
    "/documents/:path",
  ],
};
