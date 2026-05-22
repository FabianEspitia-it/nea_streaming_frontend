import { getBackendUrl } from "@/lib/backend/config";

export async function fetchBackendApi(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${getBackendUrl()}${normalizedPath}`;

  return fetch(url, {
    ...init,
    cache: "no-store",
  });
}
