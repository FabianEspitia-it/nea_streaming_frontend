import { NextRequest, NextResponse } from "next/server";
import { accessTokenCookie, refreshTokenCookie } from "@/lib/auth/cookie-options";
import { parseLoginTokens } from "@/app/api/auth/login/parse-login-response";
import { fetchBackendApi } from "@/server/fetch-backend-api";

const ERROR_MESSAGES_ES: Record<string, string> = {
  "invalid credentials": "Correo o contraseña incorrectos",
  "user not found": "Usuario no encontrado",
  "incorrect password": "Contraseña incorrecta",
  "user already exists": "El usuario ya existe",
};

function translateError(message: string): string {
  const key = message.trim().toLowerCase();
  return ERROR_MESSAGES_ES[key] ?? message;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const fallback = `No se pudo iniciar sesión (${res.status})`;
  const raw = await res.text().catch(() => "");
  if (!raw) return fallback;

  try {
    const data = JSON.parse(raw);
    if (typeof data?.detail === "string") return translateError(data.detail);
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      return translateError(String(data.detail[0].msg));
    }
    if (typeof data?.message === "string") return translateError(data.message);
    if (typeof data?.error === "string") return translateError(data.error);
  } catch {
    return translateError(raw);
  }

  return fallback;
}

export async function handleSignIn(req: NextRequest): Promise<NextResponse> {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json(
      { detail: "Email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetchBackendApi("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json(
      { detail: "No se pudo conectar con el servidor" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const message = await extractErrorMessage(upstream);
    return NextResponse.json({ detail: message }, { status: upstream.status });
  }

  let tokens: { accessToken: string; refreshToken?: string };
  try {
    tokens = await parseLoginTokens(upstream);
  } catch (e) {
    return NextResponse.json(
      {
        detail:
          e instanceof Error ? e.message : "Respuesta de autenticación inválida",
      },
      { status: 502 }
    );
  }

  if (!tokens.refreshToken) {
    return NextResponse.json(
      {
        detail:
          "Falta refresh_token en Set-Cookie del backend. El login debe enviar refresh_token como cookie HttpOnly.",
      },
      { status: 502 }
    );
  }

  const res = NextResponse.json({ ok: true });
  const access = accessTokenCookie(tokens.accessToken);
  const refresh = refreshTokenCookie(tokens.refreshToken);
  res.cookies.set(access.name, access.value, access.opts);
  res.cookies.set(refresh.name, refresh.value, refresh.opts);
  return res;
}
