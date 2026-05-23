function normalizeBackendUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function getBackendUrl(): string {
  const url = process.env.BACKEND_API_URL?.trim();

  if (!url) {
    throw new Error("BACKEND_API_URL no está configurada");
  }

  return normalizeBackendUrl(url);
}

/** URL del backend en el cliente (derivada de BACKEND_API_URL en build). */
export function getClientBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim();

  if (!url) {
    throw new Error("BACKEND_API_URL no está configurada");
  }

  return normalizeBackendUrl(url);
}
