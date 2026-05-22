import { notFound } from "next/navigation";

const ADMIN_DENIED_STATUSES = new Set([401, 403]);

export async function bffFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`/api/backend${normalized}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (ADMIN_DENIED_STATUSES.has(response.status)) {
    notFound();
  }

  return response;
}

export async function readBffError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown; message?: string };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return String(data.detail[0].msg);
    }

    if (typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Ignorar parseo.
  }

  return `Error ${res.status}`;
}
