import { NextRequest, NextResponse } from "next/server";
import { applySessionCookiesToResponse } from "@/lib/auth/apply-session-cookies";
import { resolveAccessTokenFromRequest } from "@/lib/auth/resolve-access-token";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";

/** Renueva sesión en cookies HttpOnly. No expone el JWT en el body. */
export async function GET(request: NextRequest) {
  const secure = resolveCookieSecure(request);
  const result = await resolveAccessTokenFromRequest(request);

  if ("error" in result) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  if (result.refreshed) {
    applySessionCookiesToResponse(response, result.refreshed, secure);
  }

  return response;
}
