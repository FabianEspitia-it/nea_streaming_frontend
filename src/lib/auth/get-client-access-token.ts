/**
 * Para llamadas que necesitan el JWT en el cliente (evitar si puedes usar /api/backend).
 * Las cookies httpOnly no son legibles desde JS; este helper usa los endpoints BFF.
 */
async function fetchAccessToken(): Promise<string | null> {
  const response = await fetch("/api/auth/access-token", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function getClientAccessToken(): Promise<string | null> {
  const token = await fetchAccessToken();

  if (token) {
    return token;
  }

  const refreshed = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!refreshed.ok) {
    return null;
  }

  return fetchAccessToken();
}
