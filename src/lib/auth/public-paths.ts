import type { NextRequest } from "next/server";
import { SIGN_IN_PATH } from "@/lib/auth/constants";

const PUBLIC_API_AUTH_PREFIXES = [
  "/api/auth/signin",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/refresh",
  "/api/auth/access-token",
] as const;

export function isSignInPagePath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname.startsWith(`${SIGN_IN_PATH}/`) ||
    pathname === "/login" ||
    pathname.startsWith("/login/")
  );
}

/** @deprecated Usa isSignInPagePath */
export const isLoginPath = isSignInPagePath;

/** @deprecated Usa isSignInPagePath */
export const isPublicPagePath = isSignInPagePath;

function matchesPublicApiPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicApiAuthPath(pathname: string): boolean {
  return PUBLIC_API_AUTH_PREFIXES.some((prefix) =>
    matchesPublicApiPrefix(pathname, prefix)
  );
}

/** Solo login y APIs de auth; el resto exige sesión. */
export function isPublicPath(pathname: string): boolean {
  return isSignInPagePath(pathname) || isPublicApiAuthPath(pathname);
}

export function isRefreshApiPath(pathname: string): boolean {
  return (
    pathname === "/api/auth/refresh" ||
    pathname.startsWith("/api/auth/refresh/")
  );
}

export function isRscRequest(request: NextRequest): boolean {
  return (
    request.headers.get("Rsc") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1"
  );
}
