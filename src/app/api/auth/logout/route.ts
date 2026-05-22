import { NextRequest, NextResponse } from "next/server";
import { clearedCookie } from "@/lib/auth/cookie-options";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { getRefreshTokenFromRequest } from "@/lib/auth/read-request-cookies";
import { fetchBackendApi } from "@/server/fetch-backend-api";

export async function POST(req: NextRequest) {
  const refresh = getRefreshTokenFromRequest(req);
  if (refresh) {
    try {
      await fetchBackendApi("/users/logout", {
        method: "POST",
        headers: {
          Cookie: `${REFRESH_TOKEN_COOKIE}=${refresh}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {
      // Si el backend no responde, igual borramos las cookies locales.
    }
  }

  const res = NextResponse.json({ ok: true });
  const a = clearedCookie(ACCESS_TOKEN_COOKIE);
  const r = clearedCookie(REFRESH_TOKEN_COOKIE);
  res.cookies.set(a.name, a.value, a.opts);
  res.cookies.set(r.name, r.value, a.opts);
  return res;
}
