import {
  backendServicePath,
  type StreamingService,
} from "@/lib/backend/service-paths";

function buildBffUrl(service: StreamingService, path: string): string {
  return `/api/backend${backendServicePath(service, path)}`;
}

function buildRequestHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  return response.ok;
}

/**
 * Llama al backend vía BFF. El access_token solo viaja en cookie HttpOnly;
 * el cliente nunca recibe el JWT en el body.
 */
export async function fetchBackendService(
  service: StreamingService,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = buildBffUrl(service, path);
  const requestInit: RequestInit = {
    ...init,
    headers: buildRequestHeaders(init),
    credentials: "include",
    cache: "no-store",
  };

  let response = await fetch(url, requestInit);

  if (response.status === 401 && (await refreshSession())) {
    response = await fetch(url, requestInit);
  }

  return response;
}
