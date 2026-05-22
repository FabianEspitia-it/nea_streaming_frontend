import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookiesToResponse,
  clearSessionCookiesOnResponse,
} from "@/lib/auth/apply-session-cookies";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";
import { resolveRefreshedSession } from "@/lib/auth/refresh-session";

export async function POST(req: NextRequest) {
  const secure = resolveCookieSecure(req);
  const refreshCandidates = getRefreshTokenCandidatesFromRequest(req);

  if (refreshCandidates.length === 0) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const session = await resolveRefreshedSession(refreshCandidates);

  if (!session) {
    const res = NextResponse.json({ detail: "No autenticado" }, { status: 401 });
    clearSessionCookiesOnResponse(res, secure);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  applySessionCookiesToResponse(res, session, secure);
  return res;
}
