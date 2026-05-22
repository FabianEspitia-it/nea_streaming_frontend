import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  ACCESS_MAX_AGE_SECONDS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";

type CookieSpec = {
  name: string;
  value: string;
  opts: Partial<ResponseCookie>;
};

export function getSessionCookieOptions(
  maxAge?: number,
  secure?: boolean
): Partial<ResponseCookie> {
  const domain = process.env.COOKIE_DOMAIN?.trim();

  return {
    httpOnly: true,
    secure: secure ?? resolveCookieSecure(),
    sameSite: "lax",
    path: "/",
    ...(domain ? { domain } : {}),
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function accessTokenCookie(
  token: string,
  secure?: boolean
): CookieSpec {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    opts: getSessionCookieOptions(ACCESS_MAX_AGE_SECONDS, secure),
  };
}

export function refreshTokenCookie(
  token: string,
  secure?: boolean
): CookieSpec {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: token,
    opts: getSessionCookieOptions(REFRESH_MAX_AGE_SECONDS, secure),
  };
}

export function clearedCookie(name: string, secure?: boolean): CookieSpec {
  return {
    name,
    value: "",
    opts: { ...getSessionCookieOptions(0, secure), maxAge: 0 },
  };
}
