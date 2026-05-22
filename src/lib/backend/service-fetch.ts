import {
  backendServicePath,
  type StreamingService,
} from "@/lib/backend/service-paths";

function getClientBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim();

  if (!url) {
    throw new Error("BACKEND_API_URL no está configurada");
  }

  return url.replace(/\/$/, "");
}

async function fetchAccessToken(): Promise<string | null> {
  const response = await fetch("/api/auth/access-token", {
    credentials: "include",
    cache: "no-store",
  });

  if (response.ok) {
    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  }

  if (response.status !== 401) {
    return null;
  }

  // Reintento explícito por si la página cargó antes de que el proxy/warmup renovara.
  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const retry = await fetch("/api/auth/access-token", {
    credentials: "include",
    cache: "no-store",
  });

  if (!retry.ok) {
    return null;
  }

  const data = (await retry.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function buildAuthHeaders(
  accessToken: string,
  init?: RequestInit
): Headers {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${accessToken}`);

  return headers;
}

function unauthenticatedResponse(): Response {
  return new Response(JSON.stringify({ detail: "No autenticado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export async function fetchBackendService(
  service: StreamingService,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${getClientBackendUrl()}${backendServicePath(service, path)}`;

  let accessToken = await fetchAccessToken();

  if (!accessToken) {
    return unauthenticatedResponse();
  }

  let response = await fetch(url, {
    ...init,
    headers: buildAuthHeaders(accessToken, init),
  });

  if (response.status === 401) {
    accessToken = await fetchAccessToken();

    if (!accessToken) {
      return unauthenticatedResponse();
    }

    response = await fetch(url, {
      ...init,
      headers: buildAuthHeaders(accessToken, init),
    });
  }

  return response;
}
