import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
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
  return tokens?.accessToken ?? null;
}
