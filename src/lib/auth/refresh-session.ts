import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { decodeJwtPayload } from "@/lib/auth/is-access-token-valid";
import { parseAuthSessionFromResponse } from "@/lib/auth/parse-auth-response";
import { fetchBackendApi } from "@/server/fetch-backend-api";

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
};

/** @deprecated Usa RefreshedSession */
export type RefreshedTokens = RefreshedSession;

const SESSION_CACHE_MS = 30_000;

const inFlight = new Map<string, Promise<RefreshedSession | null>>();
const recentSessions = new Map<
  string,
  { session: RefreshedSession; at: number }
>();

function candidatesCacheKey(candidates: string[]): string {
  return candidates.join("\0");
}

function pruneExpiredSessions(): void {
  const now = Date.now();

  for (const [key, entry] of recentSessions.entries()) {
    if (now - entry.at > SESSION_CACHE_MS) {
      recentSessions.delete(key);
    }
  }
}

function rememberSession(
  usedCandidates: string[],
  session: RefreshedSession
): void {
  const entry = { session, at: Date.now() };

  recentSessions.set(candidatesCacheKey(usedCandidates), entry);

  for (const token of usedCandidates) {
    recentSessions.set(token, entry);
  }

  pruneExpiredSessions();
}

function findCachedSession(candidates: string[]): RefreshedSession | null {
  const now = Date.now();

  for (const token of candidates) {
    const hit = recentSessions.get(token);

    if (hit && now - hit.at < SESSION_CACHE_MS) {
      return hit.session;
    }
  }

  const combined = recentSessions.get(candidatesCacheKey(candidates));

  if (combined && now - combined.at < SESSION_CACHE_MS) {
    return combined.session;
  }

  return null;
}

export async function parseSessionFromRefreshResponse(
  response: Response,
  fallbackRefreshToken: string
): Promise<RefreshedSession | null> {
  const parsed = await parseAuthSessionFromResponse(response, {
    fallbackRefreshToken,
  });

  if (!parsed?.accessToken) {
    return null;
  }

  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken ?? fallbackRefreshToken,
  };
}

async function refreshWithSingleToken(
  refreshToken: string
): Promise<RefreshedSession | null> {
  try {
    const response = await fetchBackendApi("/users/refresh", {
      method: "POST",
      headers: {
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    return parseSessionFromRefreshResponse(response, refreshToken);
  } catch {
    return null;
  }
}

async function resolveWithoutDedup(
  refreshCandidates: string[]
): Promise<RefreshedSession | null> {
  const cached = findCachedSession(refreshCandidates);

  if (cached) {
    return cached;
  }

  for (const refreshToken of refreshCandidates) {
    const session = await refreshWithSingleToken(refreshToken);

    if (session) {
      rememberSession(refreshCandidates, session);
      return session;
    }
  }

  return null;
}

/**
 * Renueva sesión con el backend. Deduplica peticiones paralelas y cachea 30 s
 * para peticiones con refresh token ya rotado (RSC + prefetch).
 */
export async function resolveRefreshedSession(
  refreshCandidates: string[]
): Promise<RefreshedSession | null> {
  if (refreshCandidates.length === 0) {
    return null;
  }

  const cached = findCachedSession(refreshCandidates);

  if (cached) {
    return cached;
  }

  const key = candidatesCacheKey(refreshCandidates);
  const existing = inFlight.get(key);

  if (existing) {
    return existing;
  }

  const promise = resolveWithoutDedup(refreshCandidates);
  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

export async function tryRefreshTokens(
  refreshToken: string
): Promise<RefreshedSession | null> {
  return resolveRefreshedSession([refreshToken]);
}

/** @deprecated Usa resolveRefreshedSession */
export async function tryRefreshTokensFromCandidates(
  refreshCandidates: string[]
): Promise<RefreshedSession | null> {
  return resolveRefreshedSession(refreshCandidates);
}
