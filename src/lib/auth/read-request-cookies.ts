import type { NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";

export function getRefreshTokenCandidatesFromRequest(
  request: NextRequest
): string[] {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value?.trim();

  return refreshToken ? [refreshToken] : [];
}

export function getRefreshTokenFromRequest(
  request: NextRequest
): string | undefined {
  return getRefreshTokenCandidatesFromRequest(request)[0];
}
