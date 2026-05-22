import { normalizeAccessToken } from "@/lib/auth/parse-auth-response";

export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Valida exp del JWT con 5 s de margen (skew) por desfase de reloj. */
export function isAccessTokenValid(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const normalized = normalizeAccessToken(token);

  if (!normalized) {
    return false;
  }

  const payload = decodeJwtPayload(normalized);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  const skewMs = 5000;

  return payload.exp * 1000 > Date.now() - skewMs;
}
