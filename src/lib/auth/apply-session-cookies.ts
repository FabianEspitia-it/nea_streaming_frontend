import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SIGN_IN_PATH,
} from "@/lib/auth/constants";
import {
  accessTokenCookie,
  clearedCookie,
  refreshTokenCookie,
} from "@/lib/auth/cookie-options";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export function applySessionCookiesToResponse(
  response: NextResponse,
  tokens: SessionTokens,
  secure?: boolean
): void {
  const access = accessTokenCookie(tokens.accessToken, secure);
  const refresh = refreshTokenCookie(tokens.refreshToken, secure);

  response.cookies.set(access.name, access.value, access.opts);
  response.cookies.set(refresh.name, refresh.value, refresh.opts);
}

/** Actualiza la cookie header de la request para handlers en la misma petición. */
export function applySessionCookiesToRequest(
  request: NextRequest,
  tokens: SessionTokens
): Headers {
  const requestHeaders = new Headers(request.headers);
  const cookieMap = new Map<string, string>();

  for (const cookie of request.cookies.getAll()) {
    cookieMap.set(cookie.name, cookie.value);
  }

  cookieMap.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  cookieMap.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);

  const cookieHeader = Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  requestHeaders.set("cookie", cookieHeader);

  return requestHeaders;
}

export function clearSessionCookiesOnResponse(
  response: NextResponse,
  secure?: boolean
): void {
  const access = clearedCookie(ACCESS_TOKEN_COOKIE, secure);
  const refresh = clearedCookie(REFRESH_TOKEN_COOKIE, secure);

  response.cookies.set(access.name, access.value, access.opts);
  response.cookies.set(refresh.name, refresh.value, refresh.opts);
}

/** Cookies en respuesta (navegador) y en request (handlers de esta misma petición). */
export function applyRefreshedTokens(
  request: NextRequest,
  response: NextResponse,
  tokens: SessionTokens
): void {
  const secure = resolveCookieSecure(request);
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);
  applySessionCookiesToResponse(response, tokens, secure);
}

export function continueWithRefreshedSession(
  request: NextRequest,
  tokens: SessionTokens
): NextResponse {
  const secure = resolveCookieSecure(request);
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);

  const response = NextResponse.next({ request });
  applySessionCookiesToResponse(response, tokens, secure);
  return response;
}

export function redirectToSignIn(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
}

/** @deprecated Usa applyRefreshedTokens */
export const applyRefreshedSession = applyRefreshedTokens;

/** @deprecated Usa redirectToSignIn */
export const redirectToLogin = redirectToSignIn;
