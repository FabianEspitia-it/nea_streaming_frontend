import { cookies, headers } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "@/lib/auth/cookie-options";
import {
  decodeJwtPayload,
  isAccessTokenValid,
} from "@/lib/auth/is-access-token-valid";
import { normalizeAccessToken } from "@/lib/auth/parse-auth-response";
import { resolveRefreshedSession } from "@/lib/auth/refresh-session";
import { resolveCookieSecureFromProto } from "@/lib/auth/resolve-cookie-secure";

function refreshTokenIat(token: string): number {
  const payload = decodeJwtPayload(token);

  if (payload && typeof payload.iat === "number") {
    return payload.iat;
  }

  return 0;
}

function getRefreshCandidatesFromCookieStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): string[] {
  const seen = new Set<string>();
  const candidates: { token: string; iat: number }[] = [];

  for (const cookie of cookieStore.getAll()) {
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

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const secure = resolveCookieSecureFromProto(
    headerStore.get("x-forwarded-proto")
  );
  const raw = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessToken = normalizeAccessToken(raw);

  if (isAccessTokenValid(accessToken)) {
    return accessToken!;
  }

  const refreshCandidates = getRefreshCandidatesFromCookieStore(cookieStore);

  if (refreshCandidates.length === 0) {
    return null;
  }

  const session = await resolveRefreshedSession(refreshCandidates);

  if (!session) {
    return null;
  }

  const access = accessTokenCookie(session.accessToken, secure);
  const refresh = refreshTokenCookie(session.refreshToken, secure);
  cookieStore.set(access.name, access.value, access.opts);
  cookieStore.set(refresh.name, refresh.value, refresh.opts);

  return session.accessToken;
}
