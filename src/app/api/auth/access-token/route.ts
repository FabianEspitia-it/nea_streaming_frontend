import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookiesToResponse,
  clearSessionCookiesOnResponse,
} from "@/lib/auth/apply-session-cookies";
import { resolveAccessTokenFromRequest } from "@/lib/auth/resolve-access-token";

export async function GET(request: NextRequest) {
  const result = await resolveAccessTokenFromRequest(request);

  if ("error" in result) {
    const response = NextResponse.json(
      { detail: "No autenticado" },
      { status: 401 }
    );
    clearSessionCookiesOnResponse(response);
    return response;
  }

  const response = NextResponse.json({ access_token: result.accessToken });

  if (result.refreshed) {
    applySessionCookiesToResponse(response, result.refreshed);
  }

  return response;
}
