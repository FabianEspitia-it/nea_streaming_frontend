import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import { getRefreshTokenCandidatesFromRequest } from "@/lib/auth/read-request-cookies";
import { tryRefreshTokensFromCandidates } from "@/lib/auth/try-refresh-tokens";
import type { SessionTokens } from "@/lib/auth/apply-session-cookies";

export type ResolvedAccessToken =
  | { accessToken: string; refreshed?: SessionTokens }
  | { error: "unauthenticated" };

export async function resolveAccessTokenFromRequest(
  request: NextRequest
): Promise<ResolvedAccessToken> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (isAccessTokenValid(accessToken)) {
    return { accessToken: accessToken! };
  }

  const refreshCandidates = getRefreshTokenCandidatesFromRequest(request);

  if (refreshCandidates.length === 0) {
    return { error: "unauthenticated" };
  }

  const tokens = await tryRefreshTokensFromCandidates(refreshCandidates);

  if (!tokens) {
    return { error: "unauthenticated" };
  }

  return {
    accessToken: tokens.accessToken,
    refreshed: tokens,
  };
}
