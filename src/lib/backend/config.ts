export function getBackendUrl(): string {
  const url = process.env.BACKEND_API_URL?.trim();

  if (!url) {
    throw new Error("BACKEND_API_URL no está configurada");
  }

  return url.replace(/\/$/, "");
}
