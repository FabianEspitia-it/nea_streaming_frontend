import { parseAuthSessionFromResponse } from "@/lib/auth/parse-auth-response";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { fetchBackendApi } from "@/server/fetch-backend-api";

type LoginPayload = {
  email: string;
  password: string;
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return "Credenciales inválidas";
    }
  } catch {
    // Ignorar errores de parseo.
  }

  return "No se pudo completar la solicitud";
}

export async function loginWithBackend(
  payload: LoginPayload
): Promise<{ session: AuthSession } | { error: string; status: number }> {
  const response = await fetchBackendApi("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      error: await parseErrorDetail(response),
      status: response.status,
    };
  }

  const session = await parseAuthSessionFromResponse(response);

  if (!session) {
    return {
      error: "Respuesta de autenticación inválida",
      status: 502,
    };
  }

  return { session };
}

export async function refreshWithBackend(
  refreshToken: string
): Promise<AuthSession | null> {
  const response = await fetchBackendApi("/users/refresh", {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return parseAuthSessionFromResponse(response);
}

export async function logoutWithBackend(refreshToken: string): Promise<boolean> {
  const response = await fetchBackendApi("/users/logout", {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
    },
  });

  return response.ok;
}
