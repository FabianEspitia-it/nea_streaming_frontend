import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "@/lib/auth/cookie-options";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import { tryRefreshTokens } from "@/lib/auth/try-refresh-tokens";

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (isAccessTokenValid(accessToken)) {
    return accessToken!;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value?.trim();

  if (!refreshToken) {
    return null;
  }

  const tokens = await tryRefreshTokens(refreshToken);

  if (!tokens) {
    return null;
  }

  const access = accessTokenCookie(tokens.accessToken);
  const refresh = refreshTokenCookie(tokens.refreshToken);
  cookieStore.set(access.name, access.value, access.opts);
  cookieStore.set(refresh.name, refresh.value, refresh.opts);

  return tokens.accessToken;
}
