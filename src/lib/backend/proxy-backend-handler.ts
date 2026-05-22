import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/is-access-token-valid";
import { normalizeAccessToken } from "@/lib/auth/parse-auth-response";
import { getBackendUrl } from "@/lib/backend/config";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const STRIP_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  "cookie",
  "authorization",
]);

function buildBackendUrl(request: NextRequest, path: string): string {
  const backendUrl = new URL(getBackendUrl());
  const targetPath = path.replace(/^\/+/, "");
  backendUrl.pathname = `/${targetPath}`;
  backendUrl.search = request.nextUrl.search;

  return backendUrl.toString();
}

function buildForwardHeaders(
  request: NextRequest,
  accessToken: string
): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  headers.set("Authorization", `Bearer ${accessToken}`);

  return headers;
}

/** Confía en que proxy.ts ya renovó la sesión en esta petición. */
export async function proxyToBackend(
  request: NextRequest,
  path: string
): Promise<NextResponse> {
  const raw = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessToken = normalizeAccessToken(raw);

  if (!accessToken || !isAccessTokenValid(accessToken)) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const targetUrl = buildBackendUrl(request, path);
  const headers = buildForwardHeaders(request, accessToken);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const backendResponse = await fetch(targetUrl, init);
  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}
