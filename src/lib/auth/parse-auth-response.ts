import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type PartialAuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

function readToken(
  data: Record<string, unknown>,
  snakeKey: string,
  camelKey: string
): string | null {
  const snakeValue = data[snakeKey];
  const camelValue = data[camelKey];

  if (typeof snakeValue === "string" && snakeValue.length > 0) {
    return snakeValue;
  }

  if (typeof camelValue === "string" && camelValue.length > 0) {
    return camelValue;
  }

  return null;
}

export function parseAuthTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const accessToken = readToken(data, "access_token", "accessToken");
  const refreshToken = readToken(data, "refresh_token", "refreshToken");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

function parsePartialAuthTokensFromPayload(
  payload: unknown
): PartialAuthTokens | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;

  return {
    accessToken: readToken(data, "access_token", "accessToken") ?? undefined,
    refreshToken: readToken(data, "refresh_token", "refreshToken") ?? undefined,
  };
}

function parseCookieValue(setCookie: string): { name: string; value: string } | null {
  const nameValue = setCookie.split(";")[0]?.trim();

  if (!nameValue) {
    return null;
  }

  const separatorIndex = nameValue.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  return {
    name: nameValue.slice(0, separatorIndex).trim(),
    value: nameValue.slice(separatorIndex + 1).trim(),
  };
}

export function getSetCookiesFromResponse(response: Response): string[] {
  if (typeof response.headers.getSetCookie === "function") {
    const cookies = response.headers.getSetCookie();
    if (cookies.length > 0) {
      return cookies;
    }
  }

  const headersWithRaw = response.headers as Headers & {
    raw?: () => Record<string, string[]>;
  };
  const rawSetCookies = headersWithRaw.raw?.()?.["set-cookie"];

  if (Array.isArray(rawSetCookies) && rawSetCookies.length > 0) {
    return rawSetCookies;
  }

  const singleCookie = response.headers.get("set-cookie");

  return singleCookie ? [singleCookie] : [];
}

/** Extrae tokens aunque vengan repartidos (p. ej. access en JSON y refresh en Set-Cookie). */
export function extractTokensFromSetCookies(
  setCookies: string[]
): PartialAuthTokens {
  const cookieMap = new Map<string, string>();

  for (const setCookie of setCookies) {
    const parsed = parseCookieValue(setCookie);

    if (parsed) {
      cookieMap.set(parsed.name, parsed.value);
    }
  }

  return {
    accessToken:
      cookieMap.get(ACCESS_TOKEN_COOKIE) ?? cookieMap.get("accessToken"),
    refreshToken:
      cookieMap.get(REFRESH_TOKEN_COOKIE) ?? cookieMap.get("refreshToken"),
  };
}

export function parseAuthTokensFromSetCookies(
  setCookies: string[]
): AuthTokens | null {
  const { accessToken, refreshToken } = extractTokensFromSetCookies(setCookies);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

/** Quita prefijo Bearer que algunos backends devuelven en access_token. */
export function normalizeAccessToken(
  token: string | undefined
): string | undefined {
  if (!token) {
    return undefined;
  }

  return token.replace(/^Bearer\s+/i, "").trim();
}

function mergePartialTokens(
  fromBody: PartialAuthTokens | null,
  fromCookies: PartialAuthTokens
): PartialAuthTokens {
  // Set-Cookie tiene prioridad: en refresh el backend suele rotar el refresh ahí.
  return {
    accessToken: fromCookies.accessToken ?? fromBody?.accessToken,
    refreshToken: fromCookies.refreshToken ?? fromBody?.refreshToken,
  };
}

export type ParseAuthSessionOptions = {
  /** Si el backend no devuelve refresh nuevo, conservar el de la petición. */
  fallbackRefreshToken?: string;
};

export async function parseAuthSessionFromResponse(
  response: Response,
  options?: ParseAuthSessionOptions
): Promise<AuthTokens | null> {
  const fromCookies = extractTokensFromSetCookies(
    getSetCookiesFromResponse(response)
  );

  let fromBody: PartialAuthTokens | null = null;

  try {
    const data = await response.clone().json();
    fromBody = parseAuthTokens(data) ?? parsePartialAuthTokensFromPayload(data);
  } catch {
    fromBody = null;
  }

  const merged = mergePartialTokens(fromBody, fromCookies);
  const accessToken = normalizeAccessToken(merged.accessToken);
  const refreshToken =
    merged.refreshToken?.trim() || options?.fallbackRefreshToken?.trim();

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}
