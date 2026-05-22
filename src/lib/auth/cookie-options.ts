import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  ACCESS_MAX_AGE_SECONDS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

type CookieSpec = {
  name: string;
  value: string;
  opts: Partial<ResponseCookie>;
};

export function getSessionCookieOptions(
  maxAge?: number
): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function accessTokenCookie(token: string): CookieSpec {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    opts: getSessionCookieOptions(ACCESS_MAX_AGE_SECONDS),
  };
}

export function refreshTokenCookie(token: string): CookieSpec {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: token,
    opts: getSessionCookieOptions(REFRESH_MAX_AGE_SECONDS),
  };
}

export function clearedCookie(name: string): CookieSpec {
  return {
    name,
    value: "",
    opts: { ...getSessionCookieOptions(0), maxAge: 0 },
  };
}
