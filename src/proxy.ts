import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyRefreshedTokens,
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
  isPublicPath,
  isRefreshApiPath,
  isRscRequest,
  isSignInPagePath,
} from "@/lib/auth/public-paths";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";
import { tryRefreshTokensFromCandidates } from "@/lib/auth/try-refresh-tokens";

export { ACCESS_MAX_AGE_SECONDS, REFRESH_MAX_AGE_SECONDS };

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshCandidates = getRefreshTokenCandidatesFromRequest(request);
  const refreshToken = refreshCandidates[0];

  if (isAccessTokenValid(accessToken)) {
    if (isSignInPagePath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Renovar en cualquier navegación/API (salvo el propio endpoint de refresh).
  if (refreshCandidates.length > 0 && !isRefreshApiPath(pathname)) {
    const tokens = await tryRefreshTokensFromCandidates(refreshCandidates);

    if (tokens) {
      if (isSignInPagePath(pathname)) {
        const response = NextResponse.redirect(new URL("/", request.url));
        applyRefreshedTokens(request, response, tokens);
        return response;
      }

      return continueWithRefreshedSession(request, tokens);
    }
  }

  // Servicios de códigos, home, login y APIs auth: nunca mandar a sign-in por falta de access.
  if (isPublicPath(pathname)) {
    if (isSignInPagePath(pathname) && refreshToken) {
      const response = NextResponse.next();
      clearSessionCookiesOnResponse(response, resolveCookieSecure(request));
      return response;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  if (isRscRequest(request)) {
    return NextResponse.next();
  }

  return redirectToSignIn(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
};
