export type StreamingService =
  | "netflix"
  | "disney"
  | "prime"
  | "hbo"
  | "crunchyroll"
  | "universal";

/** Ruta relativa al backend unificado (BACKEND_API_URL). */
export function backendServicePath(
  service: StreamingService,
  path: string
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${service}${normalized}`;
}
