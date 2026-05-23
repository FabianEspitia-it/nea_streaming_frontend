import { bffFetch } from "@/lib/dashboard/bff";
import type { DashboardUser, UsersListResponse } from "@/lib/dashboard/types";

const PAGE_LIMIT = 100;

type FetchUsersOptions = {
  email?: string;
};

/** Recorre todas las páginas del listado de usuarios. */
export async function fetchAllUsers(
  options: FetchUsersOptions = {}
): Promise<DashboardUser[]> {
  const all: DashboardUser[] = [];
  let skip = 0;
  let total = 0;

  do {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(PAGE_LIMIT),
    });

    if (options.email?.trim()) {
      params.set("email", options.email.trim());
    }

    const response = await bffFetch(`/users?${params.toString()}`);

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as UsersListResponse;
    const batch = data.users ?? [];

    all.push(...batch);
    total = data.total ?? all.length;
    skip += PAGE_LIMIT;

    if (batch.length === 0) {
      break;
    }
  } while (skip < total);

  return all;
}
