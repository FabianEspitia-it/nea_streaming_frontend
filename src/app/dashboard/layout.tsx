import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getServerAccessToken } from "@/lib/auth/get-server-access-token";
import { SIGN_IN_PATH } from "@/lib/auth/constants";
import { verifyDashboardAdminAccess } from "@/lib/dashboard/verify-admin-access";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = await getServerAccessToken();

  if (!accessToken) {
    redirect(SIGN_IN_PATH);
  }

  const isAdmin = await verifyDashboardAdminAccess();

  if (!isAdmin) {
    redirect(SIGN_IN_PATH);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
