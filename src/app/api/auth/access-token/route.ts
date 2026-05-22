import { NextRequest, NextResponse } from "next/server";
import { applySessionCookiesToResponse } from "@/lib/auth/apply-session-cookies";
import { resolveAccessTokenFromRequest } from "@/lib/auth/resolve-access-token";
import { resolveCookieSecure } from "@/lib/auth/resolve-cookie-secure";

export async function GET(request: NextRequest) {
  const secure = resolveCookieSecure(request);
  const result = await resolveAccessTokenFromRequest(request);

  if ("error" in result) {
    // No borrar cookies aquí: el usuario puede seguir en páginas de códigos y reintentar.
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const response = NextResponse.json({ access_token: result.accessToken });

  if (result.refreshed) {
    applySessionCookiesToResponse(response, result.refreshed, secure);
  }

  return response;
}
