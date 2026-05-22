import { getServerAccessToken } from "@/lib/auth/get-server-access-token";
import { fetchBackendApi } from "@/server/fetch-backend-api";

const ADMIN_DENIED_STATUSES = new Set([401, 403]);

export async function verifyDashboardAdminAccess(): Promise<boolean> {
  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    return false;
  }

  const response = await fetchBackendApi("/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return !ADMIN_DENIED_STATUSES.has(response.status);
}
