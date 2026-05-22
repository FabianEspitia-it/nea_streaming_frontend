import type { NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { decodeJwtPayload } from "@/lib/auth/is-access-token-valid";

function refreshTokenIat(token: string): number {
  const payload = decodeJwtPayload(token);

  if (payload && typeof payload.iat === "number") {
    return payload.iat;
  }

  return 0;
}

/** Todas las cookies refresh_token (p. ej. host-only y con dominio), más reciente primero. */
export function getRefreshTokenCandidatesFromRequest(
  request: NextRequest
): string[] {
  const seen = new Set<string>();
  const candidates: { token: string; iat: number }[] = [];

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name !== REFRESH_TOKEN_COOKIE) {
      continue;
    }

    const token = cookie.value?.trim();

    if (!token || seen.has(token)) {
      continue;
    }

    seen.add(token);
    candidates.push({ token, iat: refreshTokenIat(token) });
  }

  return candidates
    .sort((a, b) => b.iat - a.iat)
    .map((entry) => entry.token);
}

export function getRefreshTokenFromRequest(
  request: NextRequest
): string | undefined {
  return getRefreshTokenCandidatesFromRequest(request)[0];
}
