import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyRefreshedSession,
  clearSessionCookiesOnResponse,
  continueWithRefreshedSession,
  redirectToSignIn,
} from "@/lib/auth/apply-session-cookies";
import {
  ACCESS_MAX_AGE_SECONDS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import {
  isLoginPath,
  isPublicPath,
  isRefreshApiPath,
  isRscRequest,
} from "@/lib/auth/public-paths";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";
import { resolveRefreshedSession } from "@/lib/auth/refresh-session";

export { ACCESS_MAX_AGE_SECONDS, REFRESH_MAX_AGE_SECONDS };

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshCandidates = getRefreshTokenCandidatesFromRequest(request);
  const refreshToken = refreshCandidates[0];
  const valid = isAccessTokenValid(token);

  if (valid) {
    if (isLoginPath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (refreshCandidates.length > 0 && !isRefreshApiPath(pathname)) {
    const session = await resolveRefreshedSession(refreshCandidates);

    if (session) {
      if (isLoginPath(pathname)) {
        const response = NextResponse.redirect(new URL("/", request.url));
        applyRefreshedSession(request, response, session);
        return response;
      }

      return continueWithRefreshedSession(request, session);
    }
  }

  if (isPublicPath(pathname)) {
    if (isLoginPath(pathname) && refreshToken) {
      const response = NextResponse.next();
      clearSessionCookiesOnResponse(response, resolveCookieSecure(request));
      return response;
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  if (isRscRequest(request) && isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return redirectToSignIn(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
};
