import { parseAuthSessionFromResponse } from "@/lib/auth/parse-auth-response";

export type LoginTokens = {
  accessToken: string;
  refreshToken?: string;
};

export async function parseLoginTokens(response: Response): Promise<LoginTokens> {
  const session = await parseAuthSessionFromResponse(response);

  if (!session?.accessToken) {
    throw new Error("Respuesta de login inválida: falta access_token");
  }

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}
