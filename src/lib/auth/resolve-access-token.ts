import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import { normalizeAccessToken } from "@/lib/auth/parse-auth-response";
import type { SessionTokens } from "@/lib/auth/apply-session-cookies";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { resolveRefreshedSession } from "@/lib/auth/refresh-session";

export type ResolvedAccessToken =
  | { accessToken: string; refreshed?: SessionTokens }
  | { error: "unauthenticated" };

/** Renueva si hace falta (p. ej. route handlers fuera del proxy). */
export async function resolveAccessTokenFromRequest(
  request: NextRequest
): Promise<ResolvedAccessToken> {
  const raw = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessToken = normalizeAccessToken(raw);

  if (isAccessTokenValid(accessToken)) {
    return { accessToken: accessToken! };
  }

  const refreshCandidates = getRefreshTokenCandidatesFromRequest(request);

  if (refreshCandidates.length === 0) {
    return { error: "unauthenticated" };
  }

  const session = await resolveRefreshedSession(refreshCandidates);

  if (!session) {
    return { error: "unauthenticated" };
  }

  return {
    accessToken: session.accessToken,
    refreshed: session,
  };
}
