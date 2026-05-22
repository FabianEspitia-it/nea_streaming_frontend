import { parseAuthSessionFromResponse } from "@/lib/auth/parse-auth-response";
import { fetchBackendApi } from "@/server/fetch-backend-api";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";

export type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function tryRefreshTokens(
  refreshToken: string
): Promise<RefreshedTokens | null> {
  let response: Response;

  try {
    response = await fetchBackendApi("/users/refresh", {
      method: "POST",
      headers: {
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const session = await parseAuthSessionFromResponse(response, {
    fallbackRefreshToken: refreshToken,
  });

  if (!session) {
    return null;
  }

  return session;
}

/** Intenta cada candidato hasta obtener tokens nuevos. */
export async function tryRefreshTokensFromCandidates(
  refreshCandidates: string[]
): Promise<RefreshedTokens | null> {
  for (const refreshToken of refreshCandidates) {
    const tokens = await tryRefreshTokens(refreshToken);

    if (tokens) {
      return tokens;
    }
  }

  return null;
}
