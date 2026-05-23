import { bffFetch } from "@/lib/dashboard/bff";
import type { AccountRow, AccountsListResponse } from "@/lib/dashboard/types";

const SEARCH_LIMIT = 50;

/** Una sola petición filtrada por email (sin recorrer todas las páginas). */
export async function searchAccounts(email: string): Promise<AccountRow[]> {
  const trimmed = email.trim();
  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    skip: "0",
    limit: String(SEARCH_LIMIT),
    sort_by: "email",
    order: "asc",
    email: trimmed,
  });

  const response = await bffFetch(`/accounts?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as AccountsListResponse;
  return data.accounts ?? [];
}
