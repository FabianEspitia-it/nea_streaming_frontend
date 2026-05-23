import { bffFetch } from "@/lib/dashboard/bff";
import type { DashboardUser, UsersListResponse } from "@/lib/dashboard/types";

const SEARCH_LIMIT = 50;

/** Una sola petición filtrada por email (sin recorrer todas las páginas). */
export async function searchUsers(email: string): Promise<DashboardUser[]> {
  const trimmed = email.trim();
  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    skip: "0",
    limit: String(SEARCH_LIMIT),
    email: trimmed,
  });

  const response = await bffFetch(`/users?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as UsersListResponse;
  return data.users ?? [];
}
