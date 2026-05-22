import type { NextRequest } from "next/server";

/**
 * Decide si las cookies de sesión llevan el flag Secure.
 * En producción detrás de un proxy sin x-forwarded-proto, NODE_ENV=production
 * forzaba Secure=true en HTTP y el navegador ignoraba Set-Cookie.
 */
export function resolveCookieSecure(request?: NextRequest): boolean {
  const explicit = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "true" || explicit === "1") {
    return true;
  }
  if (explicit === "false" || explicit === "0") {
    return false;
  }

  const proto =
    request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request?.nextUrl.protocol.replace(":", "");

  if (proto === "https") {
    return true;
  }
  if (proto === "http") {
    return false;
  }

  if (process.env.VERCEL === "1") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

/** Para Server Components / Route Handlers sin NextRequest. */
export function resolveCookieSecureFromProto(
  forwardedProto: string | null | undefined
): boolean {
  const explicit = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === "true" || explicit === "1") {
    return true;
  }
  if (explicit === "false" || explicit === "0") {
    return false;
  }

  const proto = forwardedProto?.split(",")[0]?.trim();
  if (proto === "https") {
    return true;
  }
  if (proto === "http") {
    return false;
  }

  if (process.env.VERCEL === "1") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}
