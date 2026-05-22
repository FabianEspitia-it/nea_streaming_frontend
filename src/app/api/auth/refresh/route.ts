import { NextRequest, NextResponse } from "next/server";
import { applySessionCookiesToResponse } from "@/lib/auth/apply-session-cookies";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";
import { tryRefreshTokensFromCandidates } from "@/lib/auth/try-refresh-tokens";

export async function POST(req: NextRequest) {
  const secure = resolveCookieSecure(req);
  const refreshCandidates = getRefreshTokenCandidatesFromRequest(req);

  if (refreshCandidates.length === 0) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const tokens = await tryRefreshTokensFromCandidates(refreshCandidates);

  if (!tokens) {
    // No borrar refresh_token: puede ser un fallo temporal o carrera con el proxy.
    // Solo /api/auth/logout limpia la sesión.
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  applySessionCookiesToResponse(res, tokens, secure);
  return res;
}
