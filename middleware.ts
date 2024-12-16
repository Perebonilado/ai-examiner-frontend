import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { accessToken } from "./constants";
import { cookies } from "next/headers";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = cookies();
  console.log(req.headers.get("cookie"));
  const verifyCookie =
    cookieStore.get(accessToken) ||
    getAccessTokenFromCookiesString(req.headers.get("cookie"));

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
    "/account/settings",
  ],
};

export function getAccessTokenFromCookiesString(input: string | null) {
  if (!input) return undefined;

  // Split the string by semicolons to get individual key-value pairs
  const parts = input.split(";");

  // Find the part containing "access_token"
  const tokenPart = parts.find((part) =>
    part.trim().startsWith("access_token=")
  );

  // Extract the token if the part is found
  if (tokenPart) {
    const accessToken = tokenPart.split("=")[1];
    return accessToken;
  } else {
    return undefined;
  }
}
