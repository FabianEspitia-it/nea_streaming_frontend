import { bffFetch } from "@/lib/dashboard/bff";
import type { AccountRow, AccountsListResponse } from "@/lib/dashboard/types";

const PAGE_LIMIT = 100;

type FetchAccountsOptions = {
  email?: string;
};

/** Recorre todas las páginas del listado de cuentas. */
export async function fetchAllAccounts(
  options: FetchAccountsOptions = {}
): Promise<AccountRow[]> {
  const all: AccountRow[] = [];
  let skip = 0;
  let total = 0;

  do {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(PAGE_LIMIT),
      sort_by: "email",
      order: "asc",
    });

    if (options.email?.trim()) {
      params.set("email", options.email.trim());
    }

    const response = await bffFetch(`/accounts?${params.toString()}`);

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as AccountsListResponse;
    const batch = data.accounts ?? [];

    all.push(...batch);
    total = data.total ?? all.length;
    skip += PAGE_LIMIT;

    if (batch.length === 0) {
      break;
    }
  } while (skip < total);

  return all;
}
