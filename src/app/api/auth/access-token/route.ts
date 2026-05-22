import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import { normalizeAccessToken } from "@/lib/auth/parse-auth-response";

/** Solo lee la cookie; no refresca (el refresh lo hace /api/auth/refresh o el proxy). */
export async function GET(request: NextRequest) {
  const raw = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const access = normalizeAccessToken(raw);

  if (!access || !isAccessTokenValid(access)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ access_token: access });
}
