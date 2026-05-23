import { getClientAccessToken } from "@/lib/auth/get-client-access-token";
import { getClientBackendUrl } from "@/lib/backend/config";
import {
  backendServicePath,
  type StreamingService,
} from "@/lib/backend/service-paths";

function buildBackendUrl(service: StreamingService, path: string): string {
  return `${getClientBackendUrl()}${backendServicePath(service, path)}`;
}

function buildRequestHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function buildAuthHeaders(accessToken: string, init?: RequestInit): Headers {
  const headers = buildRequestHeaders(init);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return headers;
}

function unauthenticatedResponse(): Response {
  return new Response(JSON.stringify({ detail: "No autenticado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  return response.ok;
}

/** Llama al backend unificado directamente (BACKEND_API_URL) con JWT. */
export async function fetchBackendService(
  service: StreamingService,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = buildBackendUrl(service, path);

  let accessToken = await getClientAccessToken();

  if (!accessToken) {
    return unauthenticatedResponse();
  }

  let response = await fetch(url, {
    ...init,
    headers: buildAuthHeaders(accessToken, init),
    cache: "no-store",
  });

  if (response.status === 401 && (await refreshSession())) {
    accessToken = await getClientAccessToken();

    if (!accessToken) {
      return unauthenticatedResponse();
    }

    response = await fetch(url, {
      ...init,
      headers: buildAuthHeaders(accessToken, init),
      cache: "no-store",
    });
  }

  return response;
}
