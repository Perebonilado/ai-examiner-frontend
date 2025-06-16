import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { accessToken } from "./constants";
import { cookies } from "next/headers";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = cookies();
  const verifyCookie =
    cookieStore.get(accessToken) ||
    getAccessTokenFromCookiesString(req.headers.get("cookie"));

  // Skip middleware for Next.js internal routes
  if (pathname.startsWith("/_next")) return NextResponse.next();

  // Handle unauthenticated users
  if (!verifyCookie && !pathname.startsWith("/auth")) {
    if (pathname === "/") {
      return NextResponse.next(); // Fixed: was missing return
    } else {
      req.nextUrl.pathname = "/auth/login";
      return NextResponse.redirect(req.nextUrl);
    }
  }

  // Handle authenticated users accessing auth pages or root
  if (
    (verifyCookie && pathname.startsWith("/auth")) ||
    (verifyCookie && pathname === "/")
  ) {
    req.nextUrl.pathname = "/new-document";
    return NextResponse.redirect(req.nextUrl);
  }

  // Allow request to continue for all other cases
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/new-document",
    "/auth/login",
    "/auth/signup",
    "/questions/:path*", // Fixed: added * for dynamic segments
    "/documents/:path*", // Fixed: added * for dynamic segments
    "/account/profile",
    "/account/settings",
  ],
};

export function getAccessTokenFromCookiesString(input: string | null) {
  if (!input) return undefined;

  // Split the string by semicolons to get individual key-value pairs
  const parts = input.split(";");

  // Find the part containing the access token
  const tokenPart = parts.find((part) =>
    part.trim().startsWith(`${accessToken}=`) // Use the actual token name from constants
  );

  // Extract the token if the part is found
  if (tokenPart) {
    const token = tokenPart.split("=")[1]?.trim(); // Added trim() and optional chaining
    return token;
  } else {
    return undefined;
  }
}